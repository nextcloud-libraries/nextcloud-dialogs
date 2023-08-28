<template>
	<NcModal v-if="open"
		v-bind="modalProps"
		class="dialog__modal"
		@close="handleClose">
		<!-- The dialog name / header -->
		<h2 class="dialog__name" v-text="name" />
		<div class="dialog" :class="dialogClasses">
			<div ref="wrapper" :class="['dialog__wrapper', { 'dialog__wrapper--collapsed': isNavigationCollapsed }]">
				<!-- When the navigation is collapsed (too small dialog) it is displayed above the main content, otherwise on the inline start -->
				<nav v-if="hasNavigation" class="dialog__navigation" :class="navigationClasses">
					<slot name="navigation" :is-collapsed="isNavigationCollapsed" />
				</nav>
				<!-- Main dialog content -->
				<div class="dialog__content" :class="contentClasses">
					<slot>
						<p>{{ props.message }}</p>
					</slot>
				</div>
			</div>
			<!-- The dialog actions aka the buttons -->
			<div class="dialog__actions">
				<slot name="actions">
					<DialogButton v-for="(button, idx) in props.buttons"
						:key="idx"
						v-bind="button"
						@click="handleClose" />
				</slot>
			</div>
		</div>
	</NcModal>
</template>

<script setup lang="ts">
import type { IDialogButton } from './types'

import { NcModal } from '@nextcloud/vue'
import { useElementSize } from '@vueuse/core'
import { computed, ref, useSlots } from 'vue'

import DialogButton from './DialogButton.vue'

const props = withDefaults(defineProps<{
	/** Name of the dialog (the heading) */
	name: string
	/** Text of the dialog */
	message?: string
	/** Additional elements to add to the focus trap */
	additionalTrapElements?: string[]
	/**
	 * The element where to mount the dialog, if `null` is passed the dialog is mounted in place
	 * @default 'body'
	 */
	container?: string | null
	/**
	 * Size of the underlying NcModal
	 * @default 'small'
	 */
	size?: 'small' | 'normal' | 'large' | 'full'
	/**
	 * Buttons to display
	 * @default []
	 */
	buttons?: readonly IDialogButton[]
	/**
	 * Optionally pass additionaly classes which will be set on the navigation for custom styling
	 * @default []
	 * @example
	 * ```html
	 * <DialogBase :navigation-classes="['mydialog-navigation']"><!-- --></DialogBase>
	 * <!-- ... -->
	 * <style lang="scss">
	 * :deep(.mydialog-navigation) {
	 *     flex-direction: row-reverse;
	 * }
	 * </style>
	 * ```
	 */
	navigationClasses?: string[]
	/**
	 * Optionally pass additionaly classes which will be set on the content wrapper for custom styling
	 * @default []
	 */
	contentClasses?: string[]
	/**
	 * Optionally pass additionaly classes which will be set on the dialog itself
	 * (the default `class` attribute will be set on the modal wrapper)
	 */
	dialogClasses?: string|Record<string, boolean>|(string|Record<string, boolean>)[]
}>(), {
	additionalTrapElements: () => [],
	buttons: () => [],
	container: undefined,
	message: '',
	contentClasses: () => [],
	dialogClasses: () => [],
	navigationClasses: () => [],
	size: 'small',
})

const emit = defineEmits<{
	(e: 'close'): void
}>()

const slots = useSlots()

/**
 * The dialog wrapper element
 */
const wrapper = ref<HTMLDivElement>()

/**
 * We use the dialog width to decide if we collapse the navigation (flex direction row)
 */
const { width: dialogWidth } = useElementSize(wrapper)

/**
 * Whether the navigation is collapsed due to dialog and window size
 * (collapses when modal is below: 900px modal width - 2x 12px margin)
 */
const isNavigationCollapsed = computed(() => dialogWidth.value < 876)

/**
 * Whether a navigation was passed and the element should be displayed
 */
const hasNavigation = computed(() => slots?.navigation !== undefined)

/**
 * Whether the dialog is currently open
 */
const open = ref(true)

/**
 * Handle closing the dialog, will emit the `close` event
 */
const handleClose = () => {
	open.value = false
	emit('close')
}

/**
 * Properties to pass to the underlying NcModal
 */
const modalProps = computed(() => ({
	additionalTrapElements: props.additionalTrapElements,
	container: props.container === undefined ? 'body' : props.container,
	name: props.name,
	size: props.size,
	enableSlideshow: false,
	enableSwipe: false,
}))
</script>

<style lang="scss" scoped>
.dialog {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	&__modal {
		:deep(.modal-container) {
			display: flex !important;
		}
	}

	&__wrapper {
		margin-inline: 12px;
		margin-block: 0 12px; // remove margin to align header with close button
		display: flex;
		flex-direction: row;
		// Auto scale to fit
		flex: 1;
		min-height: 0;

		&--collapsed {
			flex-direction: column;
		}
	}

	&__navigation {
		display: flex;
		flex-shrink: 0;
	}

	// Navigation styling when side-by-side with content
	&__wrapper:not(&__wrapper--collapsed) &__navigation {
		flex-direction: column;

		overflow: hidden auto;
		height: 100%;
		min-width: 200px;
		margin-inline-end: 20px;
	}

	// Navigation styling when on top of content
	&__wrapper#{&}__wrapper--collapsed &__navigation {
		flex-direction: row;
		justify-content: space-between;

		overflow: auto hidden;
		width: 100%;
		min-width: 100%;
	}

	&__name {
		// Same as the NcAppSettingsDialog
		text-align: center;
		height: var(--default-clickable-area);
		min-height: var(--default-clickable-area);
		line-height: var(--default-clickable-area);
		margin-block: 4px 12px; // start = 4px to align with close button
	}

	&__content {
		// Auto fit
		flex: 1;
		min-height: 0;
	}

	&__actions {
		display: flex;
		gap: 6px;
		align-content: center;
		width: fit-content;
		margin-inline: auto 12px;
		margin-block: 0 12px;
	}
}
</style>
