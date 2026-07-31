<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div
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
import { computed, onMounted, onUnmounted, ref, useCssModule } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import { ToastType } from '../toast.ts'
import { t } from '../utils/l10n.js'

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

/** Mount target for arbitrary DOM Node content */
const nodeRef = ref<HTMLElement | null>(null)
let _timer: ReturnType<typeof setTimeout> | null = null

const style = useCssModule()

// Derived state
const typeClass = computed(() => props.type ? style[`toast_${props.type.replace(/^toast-/, '')}`] : null)
const isStringMessage = computed(() => typeof props.message === 'string')
const isLoading = computed(() => props.type === ToastType.LOADING)
const isUndo = computed(() => props.type === ToastType.UNDO)

/** Remove the toast (clears the auto-dismiss timer and emits dismiss). */
function dismiss(): void {
	if (_timer !== null) {
		clearTimeout(_timer)
		_timer = null
	}
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
	// Start the auto-dismiss countdown
	if (props.timeout > 0) {
		_timer = setTimeout(dismiss, props.timeout)
	}
})

onUnmounted(() => {
	if (_timer !== null) {
		clearTimeout(_timer)
		_timer = null
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
