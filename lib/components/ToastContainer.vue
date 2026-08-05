<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<!--
		Persistent aria-live regions. They must exist in the DOM *before* any
		announcement is made – injecting an element that already carries
		aria-live is unreliable on NVDA/JAWS.

		polite:    aria-atomic=false, aria-relevant=additions
				   Each appended <li> is announced individually, so queued
				   messages are not discarded when several toasts fire in
				   quick succession.

		assertive: aria-atomic=true
				   The whole text is re-read on every change, interrupting the
				   current speech for high-priority notifications (errors, undo).
				   The text is cleared after ANNOUNCEMENT_LIFETIME_MS so stale
				   content is never re-announced.
	-->
	<ul
		ref="politeRef"
		aria-live="polite"
		aria-atomic="false"
		aria-relevant="additions"
		class="hidden-visually" />
	<div
		ref="assertiveRef"
		aria-live="assertive"
		aria-atomic="true"
		class="hidden-visually" />

	<!--
		Visual notification stack.
		Individual toasts are mounted here by toast.ts via createApp;
		this component only manages positioning, focus and lifecycle.

		The stack is a labelled region so it can be reached with the
		TOAST_FOCUS_HOTKEY shortcut and found in the landmark list of a screen
		reader. Role and label are only exposed while toasts are actually shown,
		so every page is not left with an empty "Notifications" landmark.
	-->
	<div
		ref="containerRef"
		:class="[$style.toastContainer, { [$style.toastContainer_navOpen]: navOpen }]"
		data-nc-toast-stack
		tabindex="-1"
		:role="hasToasts ? 'region' : undefined"
		:aria-label="hasToasts ? stackLabel : undefined"
		@focusin="handleFocusIn"
		@focusout="handleFocusOut"
		@keydown.esc="handleEscape" />
</template>

<script setup lang="ts">
import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { t } from '../utils/l10n.js'
import { TOAST_FOCUS_HOTKEY, TOAST_FOCUS_RELEASE_EVENT } from './toastStack.ts'

/**
 * How long (ms) a live-region item stays in the DOM.
 * Long enough for a screen reader to finish speaking the message, but short
 * enough to prevent stale text from being re-announced if the region is
 * triggered again.
 */
const ANNOUNCEMENT_LIFETIME_MS = 7000

let _assertiveClearTimer: ReturnType<typeof setTimeout> | null = null

const politeRef = useTemplateRef('politeRef')
const assertiveRef = useTemplateRef('assertiveRef')
const containerRef = useTemplateRef('containerRef')

/** Accessible name of the stack, mentioning the shortcut that reaches it */
const stackLabel = t('Notifications ({hotkey})', { hotkey: TOAST_FOCUS_HOTKEY })

/**
 * Whether the stack currently holds at least one toast.
 * Toasts are mounted by toast.ts as separate Vue apps, so their number is
 * observed from the DOM rather than tracked in this component's state.
 */
const hasToasts = ref(false)

/**
 * Element that had the focus before it moved into the stack. Kept only while
 * the stack owns the focus, so it can be handed back when the user leaves the
 * stack with Escape or when the toast holding the focus is dismissed.
 */
let _previousFocus: HTMLElement | null = null
let _toastObserver: MutationObserver | null = null

/**
 * Tracks whether the Nextcloud app-navigation sidebar is currently open.
 * Defaults to open on desktop (> 1024 px), closed on mobile.
 * Corrected on the first `toggle-navigation` event.
 * The NcAppNavigation component emits this event whenever the sidebar
 * is toggled, including on initial page load ⚠️!
 */
const navOpen = ref(false)

/**
 * Listen for navigation toggle events to adjust the toast container's position
 * accordingly. The event is emitted by the Nextcloud NcAppNavigation component.
 *
 * @param event The event object emitted by the navigation toggle.
 * @param event.open Whether the navigation is now open or closed.
 */
function handleNavigationToggle({ open }: { open: boolean }): void {
	navOpen.value = open
}

/**
 * Announce text in the appropriate persistent live region.
 *
 * Polite – appends a new <li> so queued messages are not discarded.
 *   Each addition is announced separately (aria-atomic=false, aria-relevant=additions).
 *   The element is removed after ANNOUNCEMENT_LIFETIME_MS to keep the DOM lean.
 *
 * Assertive – replaces the current text so the screen reader interrupts
 *   immediately. The previous clear timer is cancelled to prevent early
 *   erasure when two assertive toasts fire in quick succession.
 *
 * @param text  The announcement text.
 * @param level 'polite' or 'assertive'.
 */
function announce(text: string, level: 'polite' | 'assertive'): void {
	if (level === 'assertive') {
		const el = assertiveRef.value
		if (!el) {
			return
		}

		// Cancel any previously scheduled clear so the new message gets its full lifetime.
		if (_assertiveClearTimer !== null) {
			clearTimeout(_assertiveClearTimer)
			_assertiveClearTimer = null
		}

		// Synchronous clear – lets the same message be re-announced when fired again.
		el.textContent = ''

		// Re-set after a short delay so screen readers observe the content *change*.
		setTimeout(() => {
			if (!el) {
				return
			}

			el.textContent = text
			_assertiveClearTimer = setTimeout(() => {
				el.textContent = ''
				_assertiveClearTimer = null
			}, ANNOUNCEMENT_LIFETIME_MS)
		}, 50)
	} else {
		const el = politeRef.value
		if (!el) {
			return
		}

		// Append a new item; with aria-atomic=false only the addition is announced.
		const li = document.createElement('li')
		li.textContent = text
		el.appendChild(li)

		// Clean up after the SR has had time to read the item.
		setTimeout(() => li.remove(), ANNOUNCEMENT_LIFETIME_MS)
	}
}

/**
 * Return the host element of the visual toast stack.
 * toast.ts mounts individual ToastNotification apps inside this element.
 */
function getContainerEl(): HTMLElement | null {
	return containerRef.value
}

/**
 * Give the focus back to the element the user came from, if it is still around.
 */
function returnFocus(): void {
	const previous = _previousFocus
	_previousFocus = null
	if (previous?.isConnected) {
		previous.focus()
	}
}

/**
 * Move the focus into the stack, remembering where it came from.
 * Ignored while no toast is shown, so the shortcut keeps its browser default
 * on pages without notifications.
 *
 * @param event The keydown event of the shortcut
 */
function handleHotkey(event: KeyboardEvent): void {
	const el = containerRef.value
	if (event.key !== TOAST_FOCUS_HOTKEY
		|| event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
		|| !el || el.children.length === 0 || el.contains(document.activeElement)) {
		return
	}

	event.preventDefault()
	_previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
	el.focus()
}

/**
 * Remember where the focus came from when it enters the stack by other means
 * than the shortcut, e.g. by tabbing into it.
 *
 * @param event The focusin event
 */
function handleFocusIn(event: FocusEvent): void {
	const el = containerRef.value
	const from = event.relatedTarget
	if (!el || (from instanceof Node && el.contains(from))) {
		// Moving between elements inside the stack, the origin is unchanged
		return
	}

	_previousFocus = from instanceof HTMLElement ? from : _previousFocus
}

/**
 * Forget the remembered origin once the focus really leaves the stack.
 * A focusout without a new target means the focused element went away, which
 * is handled by handleFocusRelease – the origin is still needed there.
 *
 * @param event The focusout event
 */
function handleFocusOut(event: FocusEvent): void {
	const el = containerRef.value
	const to = event.relatedTarget
	if (!el || !(to instanceof Node) || el.contains(to)) {
		return
	}

	_previousFocus = null
}

/**
 * Leave the stack on Escape, back to where the focus came from.
 * The event is not propagated further so an app listening for Escape on the
 * document does not also react to it, e.g. by closing an unrelated dialog.
 *
 * @param event The keydown event
 */
function handleEscape(event: KeyboardEvent): void {
	if (!_previousFocus) {
		return
	}

	event.stopPropagation()
	returnFocus()
}

/**
 * Take the focus over from a toast that is about to be removed while holding
 * it: stay in the stack as long as other toasts are left, otherwise hand the
 * focus back to the element the user came from.
 */
function handleFocusRelease(): void {
	const el = containerRef.value
	if (!el) {
		return
	}

	// The dismissed toast is still part of the stack at this point
	if (el.children.length > 1) {
		el.focus()
	} else {
		returnFocus()
	}
}

onMounted(() => {
	// Seed the initial state from the DOM in case the navigation-toggled event
	// was already fired before this component was mounted.
	// NcAppNavigation adds `app-navigation--close` when the sidebar is closed.
	const navEl = document.querySelector('.app-navigation')
	if (navEl) {
		navOpen.value = !navEl.classList.contains('app-navigation--close')
	}

	subscribe('navigation-toggled', handleNavigationToggle)

	document.addEventListener('keydown', handleHotkey)
	containerRef.value?.addEventListener(TOAST_FOCUS_RELEASE_EVENT, handleFocusRelease)

	// Toasts are mounted into the stack from the outside, so the only way to
	// know whether any is shown is to watch the element's children.
	if (containerRef.value) {
		_toastObserver = new MutationObserver(() => {
			hasToasts.value = (containerRef.value?.children.length ?? 0) > 0
		})
		_toastObserver.observe(containerRef.value, { childList: true })
	}
})

onUnmounted(() => {
	unsubscribe('navigation-toggled', handleNavigationToggle)

	document.removeEventListener('keydown', handleHotkey)
	containerRef.value?.removeEventListener(TOAST_FOCUS_RELEASE_EVENT, handleFocusRelease)

	_toastObserver?.disconnect()
	_toastObserver = null
})

defineExpose({ announce, getContainerEl })
</script>

<style module lang="scss">
.toastContainer {
	position: fixed;
	// Default: no navigation sidebar
	left: var(--body-container-margin);
	bottom: var(--body-container-margin);
	z-index: 10100;
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	align-items: flex-start;
	// Individual toasts manage their own pointer-events
	pointer-events: none;
	padding: calc(var(--default-grid-baseline) * 2);
	// Smooth transition when the navigation opens / closes
	transition: left var(--animation-quick, 100ms) ease;

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}

	// Make the shortcut visible: the whole stack is outlined when focused
	&:focus-visible {
		outline: var(--border-width-input-focused, 2px) solid var(--color-main-text);
		outline-offset: 2px;
		border-radius: var(--border-radius-element, var(--border-radius));
	}
}

// When the app navigation is visible, shift right to avoid overlap
.toastContainer_navOpen {
	left: calc(var(--navigation-width) + var(--body-container-margin));
}
</style>
