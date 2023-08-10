<template>
	<NcModal v-if="open" v-bind="modalProps" @close="handleClose">
		<Fragment>
			<div ref="wrapper" :class="['dialog__wrapper', { 'dialog__wrapper--collapsed': isNavigationCollapsed }]">
				<!-- If the navigation is shown on top of the content, the header should be above the navigation -->
				<h2 v-if="isNavigationCollapsed" class="dialog__name">
					{{ props.name }}
				</h2>
				<!-- When the navigation is collapsed (too small dialog) it is displayed above the main content, otherwise on the inline start -->
				<nav v-if="hasNavigation" :class="['dialog__navigation', ...navigationClasses]">
					<slot name="navigation" :is-collapsed="isNavigationCollapsed" />
				</nav>
				<!-- Man dialog content -->
				<div class="dialog__content">
					<!-- If the navigation is shown on the side the header should be directly aligned with the content -->
					<h2 v-if="!isNavigationCollapsed" class="dialog__name">
						{{ props.name }}
					</h2>
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
		</Fragment>
	</NcModal>
</template>

<script setup lang="ts">
import { NcModal } from '@nextcloud/vue'
import { computed, ref, useSlots } from 'vue'
import DialogButton, { type IDialogButton } from './DialogButton.vue'
import { Fragment } from 'vue-frag'
import { useElementSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
	/** Name of the dialog (the heading) */
	name: string
	/** Text of the dialog */
	message?: string
	/**
	 * The element here to mount the dialog
	 * @default 'body'
	 */
	container?: string
	/**
	 * Size of the underlying NcModal
	 * @default 'normal'
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
}>(), {
	size: 'normal',
	container: 'body',
	message: '',
	buttons: () => [],
	navigationClasses: () => [],
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

const modalProps = computed(() => ({
	container: props.container,
	name: props.name,
	size: props.size,
}))
</script>

<style lang="scss" scoped>
.dialog {
	&__wrapper {
		margin-inline: 12px;
		margin-block: 0 12px; // remove margin to align header with close button
		display: flex;
		flex-direction: row;

		&--collapsed {
			flex-direction: column;
		}
	}

	&__navigation {
		display: flex;
	}

	// Navigation styling when side-by-side with content
	&__wrapper:not(&__wrapper--collapsed) &__navigation {
		margin-block-start: calc(var(--default-clickable-area) + 16px); // align with __name (4px top & 12px bottom margin)
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
		text-align: start;
		height: var(--default-clickable-area);
		min-height: var(--default-clickable-area);
		line-height: var(--default-clickable-area);
		margin-block: 4px 12px; // start = 4px to align with close button
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
