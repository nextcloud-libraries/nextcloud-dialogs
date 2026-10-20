<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcBreadcrumbs class="file-picker__breadcrumbs">
		<template #default>
			<NcBreadcrumb
				:name="t('All files')"
				:title="t('Home')"
				@click="path = '/'">
				<template #icon>
					<IconHome :size="20" />
				</template>
			</NcBreadcrumb>
			<NcBreadcrumb
				v-for="dir in pathElements"
				:key="dir.path"
				:name="dir.name"
				:title="dir.path"
				@click="path = dir.path" />
		</template>
		<template v-if="showMenu" #actions>
			<NcPopover
				v-model:shown="popoverShown"
				popupRole="dialog"
				@afterHide="newNodeName = ''">
				<template #trigger>
					<NcButton :aria-label="t('Create directory')" variant="secondary">
						<template #icon>
							<IconPlus :size="20" />
						</template>
						{{ t('New') }}
					</NcButton>
				</template>
				<form
					class="file-picker__new-folder"
					role="dialog"
					:aria-label="t('Create directory')"
					@submit.prevent="onSubmit"
					@keydown.esc="popoverShown = false">
					<IconFolder :size="20" />
					<label class="file-picker__new-folder-label" :for="inputId">{{ t('New folder') }}</label>
					<NcTextField
						:id="inputId"
						ref="nameInput"
						v-model="newNodeName"
						class="file-picker__new-folder-input"
						labelOutside
						:placeholder="t('New folder name')"
						showTrailingButton
						trailingButtonIcon="arrowEnd"
						:trailingButtonLabel="t('Create directory')"
						@trailingButtonClick="onSubmit"
						@update:modelValue="validateInput" />
				</form>
			</NcPopover>
		</template>
	</NcBreadcrumbs>
</template>

<script setup lang="ts">
import { InvalidFilenameError, InvalidFilenameErrorReason, validateFilename } from '@nextcloud/files'
import { computed, ref, useId, useTemplateRef } from 'vue'
import NcBreadcrumb from '@nextcloud/vue/components/NcBreadcrumb'
import NcBreadcrumbs from '@nextcloud/vue/components/NcBreadcrumbs'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcPopover from '@nextcloud/vue/components/NcPopover'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconFolder from 'vue-material-design-icons/Folder.vue'
import IconHome from 'vue-material-design-icons/Home.vue'
import IconPlus from 'vue-material-design-icons/Plus.vue'
import { t } from '../../utils/l10n.ts'

/** Current path to display */
const path = defineModel<string>('path', { required: true })

defineProps<{
	/** Whether to show the "new node" menu or not */
	showMenu?: boolean
}>()

const emit = defineEmits<{
	/**
	 * Triggered when a new directory on the current path should be created
	 */
	createNode: [name: string]
}>()

const popoverShown = ref(false)

/**
 * Input on the "new node" menu
 */
const newNodeName = ref('')

const inputId = useId()

const nameInput = useTemplateRef('nameInput')

/**
 * Validate user folder name input
 */
function validateInput() {
	const name = newNodeName.value.trim()
	const input = nameInput.value?.$el?.querySelector('input')

	let validity = ''
	try {
		validateFilename(name)
	} catch (error) {
		if (!(error instanceof InvalidFilenameError)) {
			throw error
		}

		switch (error.reason) {
			case InvalidFilenameErrorReason.Character:
				validity = t('"{char}" is not allowed inside a folder name.', { char: error.segment })
				break
			case InvalidFilenameErrorReason.ReservedName:
				validity = t('"{segment}" is a reserved name and not allowed for folder names.', { segment: error.segment })
				break
			case InvalidFilenameErrorReason.Extension:
				validity = t('Folder names must not end with "{extension}".', { extension: error.segment })
				break
			default:
				validity = t('Invalid folder name.')
		}
	}
	if (input) {
		input.setCustomValidity(validity)
	}
	return validity === ''
}
/**
 * Handle creating a new node
 */
function onSubmit() {
	const name = newNodeName.value.trim()

	if (validateInput()) {
		popoverShown.value = false
		emit('createNode', name)
		newNodeName.value = ''
	} else {
		// show the native validation message, e.g. when submitted via the trailing button
		nameInput.value?.$el?.querySelector('input')?.reportValidity()
	}
}

/**
 * Split current path and provide the path and the basename
 */
const pathElements = computed(() => path.value.split('/')
	.filter((v) => v !== '')
	.map((v, i, elements) => ({
		name: v,
		path: '/' + elements.slice(0, i + 1).join('/'),
	})))
</script>

<style scoped lang="scss">
.file-picker {
	&__breadcrumbs {
		// ensure the breadcrumbs have a static height
		flex-grow: 0 !important;
	}

	// mimic the NcActionInput layout inside an NcActions menu (icon column, label row, input row) for consistency with other menus
	&__new-folder {
		display: grid;
		grid-template-columns: var(--default-clickable-area) 1fr;
		align-items: center;
		padding: calc(2 * var(--default-grid-baseline));
		padding-inline-start: var(--default-grid-baseline);
		padding-inline-end: calc(var(--default-grid-baseline) + (var(--default-clickable-area) - 16px) / 2);
		padding-bottom: calc(var(--default-grid-baseline) + (var(--default-clickable-area) - 16px) / 2);
	}

	&__new-folder-label {
		padding: var(--default-grid-baseline) 0;
	}

	// the icon and the label fill the first row, so the input goes to the second row
	&__new-folder-input {
		grid-column: 2;
	}
}
</style>
