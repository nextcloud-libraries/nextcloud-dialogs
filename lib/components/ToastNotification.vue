<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div
		ref="rootRef"
		:class="[$style.toast, typeClass, { [$style.toast_clickable]: onClick }]"
		:role="role"
		@click="onClick?.()">
		<!-- Loading: text + spinner pushed to the right -->
		<template v-if="isLoading">
			<span :class="$style.toastMessage">{{ message }}</span>
			<span :class="$style.toastLoader" aria-hidden="true">
				<NcLoadingIcon :size="20" />
			</span>
		</template>

		<!-- Undo: text + undo button -->
		<template v-else-if="isUndo">
			<span :class="$style.toastMessage">{{ message }}</span>
			<NcButton
				:class="$style.toastUndoButton"
				variant="tertiary"
				@click.stop="handleUndoClick">
				{{ t('Undo') }}
			</NcButton>
		</template>

		<!-- Default: plain string, HTML string, or arbitrary DOM Node -->
		<template v-else>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<span v-if="isHTML && isStringMessage" :class="$style.toastMessage" v-html="message" />
			<span v-else-if="isStringMessage" :class="$style.toastMessage">{{ message }}</span>
			<!-- Node content is appended in onMounted -->
			<span v-else ref="nodeRef" :class="$style.toastMessage" />
		</template>

		<!-- Close button -->
		<NcButton
			v-if="!noClose"
			:class="$style.toastClose"
			variant="tertiary"
			:aria-label="t('Close')"
			@click.stop="dismiss">
			<template #icon>
				<NcIconSvgWrapper :path="mdiClose" :size="20" />
			</template>
		</NcButton>
	</div>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, useCssModule, useTemplateRef } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import { ToastType } from '../toast.ts'
import { t } from '../utils/l10n.js'
import { TOAST_FOCUS_RELEASE_EVENT, TOAST_STACK_SELECTOR } from './toastStack.ts'

const props = withDefaults(defineProps<{
	/** Text or DOM node to display as the toast body */
	message: string | Node
	/** Allow raw HTML in the message (only when message is a string) */
	isHTML?: boolean
	/** Visual type variant (controls left-border colour and element icons) */
	type?: ToastType
	/** Auto-dismiss delay in ms; -1 means permanent */
	timeout: number
	/** Hide the close button */
	noClose?: boolean
	/** ARIA role derived from the aria-live level */
	role: 'alert' | 'status'
	/** Optional click handler for the whole toast */
	onClick?: () => void
	/** Undo callback, only used when type is UNDO */
	onUndo?: (event: MouseEvent) => void
}>(), {
	isHTML: false,
	type: undefined,
	noClose: false,
	onClick: undefined,
	onUndo: undefined,
})

const emit = defineEmits<{
	/** Emitted when the toast should be removed (close btn, timer, or undo) */
	dismiss: []
}>()

/**
 * Minimum time (ms) a toast is shown again after the user stops interacting
 * with the stack. Without it a toast whose countdown ran out while paused
 * would vanish the instant the pointer leaves, which reads as a glitch.
 */
const MIN_RESUME_TIMEOUT = 1000

/** Mount target for arbitrary DOM Node content */
const nodeRef = ref<HTMLElement | null>(null)
const rootRef = useTemplateRef<HTMLElement>('rootRef')

/** Running auto-dismiss timer; `null` while paused or for permanent toasts */
let _timer: ReturnType<typeof setTimeout> | null = null
/** Time (ms) left on the countdown, updated every time it is paused */
let _remaining = 0
/** `Date.now()` of the moment the countdown was last started */
let _startedAt = 0
/**
 * Element the pause listeners are bound to: the shared stack if this toast is
 * mounted inside a ToastContainer, otherwise the toast itself.
 * Listening on the stack means interacting with *any* toast pauses all of
 * them – a toast must not disappear while the user is reading the one above it.
 */
let _pauseTarget: HTMLElement | null = null
/** Whether the pointer is currently over the stack */
let _isHovered = false
/** Whether the focus is currently inside the stack */
let _isFocused = false

const style = useCssModule()

// Derived state
const typeClass = computed(() => props.type ? style[`toast_${props.type.replace(/^toast-/, '')}`] : null)
const isStringMessage = computed(() => typeof props.message === 'string')
const isLoading = computed(() => props.type === ToastType.LOADING)
const isUndo = computed(() => props.type === ToastType.UNDO)

/** Stop the auto-dismiss timer without touching the remaining time. */
function clearTimer(): void {
	if (_timer !== null) {
		clearTimeout(_timer)
		_timer = null
	}
}

/** Start – or resume – the auto-dismiss countdown with the time left on it. */
function startTimer(): void {
	if (_timer !== null || _remaining <= 0) {
		return
	}
	_startedAt = Date.now()
	_timer = setTimeout(dismiss, _remaining)
}

/** Freeze the auto-dismiss countdown, remembering how much time is left. */
function pauseTimer(): void {
	if (_timer === null) {
		return
	}

	clearTimer()
	// Never floor above the timeout the caller asked for, a short-lived toast
	// must not outlive it just because it was hovered
	const floor = Math.min(MIN_RESUME_TIMEOUT, props.timeout)
	_remaining = Math.max(floor, _remaining - (Date.now() - _startedAt))
}

/**
 * Hold the countdown while the user is hovering or keyboard-focusing the
 * stack, and resume it once they are done (WCAG 2.2.1 – Timing Adjustable).
 */
function updateTimerState(): void {
	if (_isHovered || _isFocused) {
		pauseTimer()
	} else {
		startTimer()
	}
}

/**
 * Check whether the pointer or focus only moved between elements *inside* the
 * stack. `pointerout` / `focusout` bubble, so moving from a toast to its close
 * button would otherwise be reported as leaving the stack.
 *
 * @param event The pointerout or focusout event
 * @return True when the new target is still part of the stack
 */
function movedWithinStack(event: PointerEvent | FocusEvent): boolean {
	return event.relatedTarget instanceof Node
		&& (_pauseTarget?.contains(event.relatedTarget) ?? false)
}

/** Pointer entered the stack: hold the countdown. */
function handlePointerOver(): void {
	_isHovered = true
	updateTimerState()
}

/**
 * Pointer left the stack: resume the countdown.
 *
 * @param event The pointerout event
 */
function handlePointerOut(event: PointerEvent): void {
	if (movedWithinStack(event)) {
		return
	}
	_isHovered = false
	updateTimerState()
}

/** Focus moved into the stack: hold the countdown. */
function handleFocusIn(): void {
	_isFocused = true
	updateTimerState()
}

/**
 * Focus left the stack: resume the countdown.
 *
 * @param event The focusout event
 */
function handleFocusOut(event: FocusEvent): void {
	if (movedWithinStack(event)) {
		return
	}
	_isFocused = false
	updateTimerState()
}

/** Remove the toast (clears the auto-dismiss timer and emits dismiss). */
function dismiss(): void {
	clearTimer()
	emit('dismiss')
}

/**
 * Handle click on the undo button: stop propagation,
 * call the undo callback, and dismiss the toast.
 *
 * @param event The click event from the undo button
 */
function handleUndoClick(event: MouseEvent): void {
	// Prevent the click from bubbling up to the toast's onClick handler
	event.stopPropagation()
	props.onUndo?.(event)
	dismiss()
}

onMounted(() => {
	// Attach arbitrary DOM Node content into the message slot
	if (props.message instanceof Node && nodeRef.value) {
		nodeRef.value.appendChild(props.message)
	}

	_pauseTarget = rootRef.value?.closest<HTMLElement>(TOAST_STACK_SELECTOR) ?? rootRef.value
	if (_pauseTarget) {
		_pauseTarget.addEventListener('pointerover', handlePointerOver)
		_pauseTarget.addEventListener('pointerout', handlePointerOut)
		_pauseTarget.addEventListener('focusin', handleFocusIn)
		_pauseTarget.addEventListener('focusout', handleFocusOut)

		// The user may already be interacting with the stack when this toast is
		// added to it – no pointerover/focusin fires in that case.
		_isHovered = _pauseTarget.matches(':hover')
		_isFocused = _pauseTarget.contains(document.activeElement)
	}

	// Start the auto-dismiss countdown, unless the toast is permanent
	if (props.timeout > 0) {
		_remaining = props.timeout
		updateTimerState()
	}
})

onBeforeUnmount(() => {
	// Still in the DOM here, so we can tell whether this toast holds the focus.
	// Hand it over to the container before disappearing, otherwise a keyboard
	// user who just pressed the close button is dropped on <body>.
	if (rootRef.value?.contains(document.activeElement) && _pauseTarget !== rootRef.value) {
		_pauseTarget?.dispatchEvent(new CustomEvent(TOAST_FOCUS_RELEASE_EVENT))
	}
})

onUnmounted(() => {
	clearTimer()

	if (_pauseTarget) {
		_pauseTarget.removeEventListener('pointerover', handlePointerOver)
		_pauseTarget.removeEventListener('pointerout', handlePointerOut)
		_pauseTarget.removeEventListener('focusin', handleFocusIn)
		_pauseTarget.removeEventListener('focusout', handleFocusOut)
		_pauseTarget = null
	}
})

defineExpose({ hide: dismiss })
</script>

<style module lang="scss">
$spacing: 12px;

@keyframes toast-in {
	from {
		opacity: 0;
		transform: translateY(-6px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.toast {
	min-width: 200px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	box-shadow: 0 0 6px 0 var(--color-box-shadow);
	padding: 0 $spacing;
	border-radius: var(--border-radius);
	display: flex;
	align-items: center;
	min-height: var(--clickable-area-large);
	pointer-events: auto;
	animation: toast-in var(--animation-slow) ease-out;

	// Users who asked for less motion get the toast without the slide-in
	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
}

// Modifiers

.toast_clickable {
	cursor: pointer;
}

.toast_error {
	border-left: 3px solid var(--color-element-error, var(--color-error));
}

.toast_info {
	border-left: 3px solid var(--color-element-info, var(--color-primary));
}

.toast_warning {
	border-left: 3px solid var(--color-element-warning, var(--color-warning));
}

.toast_success {
	border-left: 3px solid var(--color-element-success, var(--color-success));
}

.toast_undo {
	border-left: 3px solid var(--color-element-success, var(--color-success));
}

.toast_loading {
	border-left: 3px solid var(--color-element-info, var(--color-primary));
}

// Elements

.toastMessage {
	flex: 1;
	padding: $spacing 0;
}

.toastLoader,
.toastClose,
.toastUndoButton {
	display: flex;
	align-items: center;
	margin-left: $spacing;
	flex-shrink: 0;
}
</style>
