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
			<NcActions
				v-model:open="actionsOpen"
				:aria-label="t('Create directory')"
				:forceMenu="true"
				:forceName="true"
				:menuName="t('New')"
				variant="secondary"
				@close="newNodeName = ''">
				<template #icon>
					<IconPlus :size="20" />
				</template>
				<NcActionInput
					ref="nameInput"
					v-model="newNodeName"
					:label="t('New folder')"
					:placeholder="t('New folder name')"
					@submit="onSubmit"
					@update:modelValue="validateInput">
					<template #icon>
						<IconFolder :size="20" />
					</template>
				</NcActionInput>
			</NcActions>
		</template>
	</NcBreadcrumbs>
</template>

<script setup lang="ts">
import { InvalidFilenameError, InvalidFilenameErrorReason, validateFilename } from '@nextcloud/files'
import { computed, ref, useTemplateRef } from 'vue'
import NcActionInput from '@nextcloud/vue/components/NcActionInput'
import NcActions from '@nextcloud/vue/components/NcActions'
import NcBreadcrumb from '@nextcloud/vue/components/NcBreadcrumb'
import NcBreadcrumbs from '@nextcloud/vue/components/NcBreadcrumbs'
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

const actionsOpen = ref(false)

/**
 * Input on the "new node" menu
 */
const newNodeName = ref('')

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
		actionsOpen.value = false
		emit('createNode', name)
		newNodeName.value = ''
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
}
</style>
