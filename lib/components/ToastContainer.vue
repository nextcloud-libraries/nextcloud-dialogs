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
		this component only manages positioning and lifecycle.
	-->
	<div
		ref="containerRef"
		:class="[$style.toastContainer, { [$style.toastContainer_navOpen]: navOpen }]" />
</template>

<script setup lang="ts">
import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

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

onMounted(() => {
	// Seed the initial state from the DOM in case the navigation-toggled event
	// was already fired before this component was mounted.
	// NcAppNavigation adds `app-navigation--close` when the sidebar is closed.
	const navEl = document.querySelector('.app-navigation')
	if (navEl) {
		navOpen.value = !navEl.classList.contains('app-navigation--close')
	}

	subscribe('navigation-toggled', handleNavigationToggle)
})

onUnmounted(() => {
	unsubscribe('navigation-toggled', handleNavigationToggle)
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
}

// When the app navigation is visible, shift right to avoid overlap
.toastContainer_navOpen {
	left: calc(var(--navigation-width) + var(--body-container-margin));
}
</style>
