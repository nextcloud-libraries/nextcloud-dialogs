<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { INode } from '@nextcloud/files'
import type { ConflictInput } from '../../conflict-picker.ts'

import { mdiArrowRight } from '@mdi/js'
import { FileType } from '@nextcloud/files'
import { computed, ref, watch } from 'vue'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import ConflictPickerCard from './ConflictPickerCard.vue'
import { getPreviewURL } from '../../composables/preview.ts'
import { t } from '../../utils/l10n.ts'

/**
 * Is the existing node selected
 */
const existingSelected = defineModel<boolean>('existingSelected', { required: true })

/**
 * Is the incoming node selected
 */
const incomingSelected = defineModel<boolean>('incomingSelected', { required: true })

const props = defineProps<{
	/**
	 * The existing node
	 */
	existing: INode

	/**
	 * The new incoming node
	 */
	incoming: ConflictInput

	/**
	 * Single-file mode: render the two versions without checkboxes.
	 * The parent then offers "Keep both"/"Replace" buttons instead.
	 */
	isSingle?: boolean
}>()

defineExpose({ validate })

const isFileSystemEntry = (o: unknown): o is FileSystemEntry => 'FileSystemEntry' in window && o instanceof window.FileSystemEntry
const isFileSystemFileEntry = (o: unknown): o is FileSystemFileEntry => 'FileSystemFileEntry' in window && o instanceof window.FileSystemFileEntry

const PREVIEW_SIZE = 64

const validationMessage = ref('')

const incomingPreview = ref<string>()
const existingPreview = ref<string>()

const incomingMTime = ref<Date>()
const existingMTime = ref<Date>()

const incomingSize = ref<number>()
const existingSize = ref<number>()

const conflictResolved = computed(() => incomingSelected.value || existingSelected.value)

const isExistingFolder = computed(() => props.existing.type === FileType.Folder)
const isIncomingFolder = computed(() => {
	if (isFileSystemEntry(props.incoming)) {
		return props.incoming.isDirectory
	} else if (props.incoming instanceof File) {
		return false
	}
	return props.incoming.type === FileType.Folder
})

// Bold whichever value differs to ease comparison: the newer date and the larger size.
const incomingNewer = computed(() => !!incomingMTime.value && !!existingMTime.value && incomingMTime.value > existingMTime.value)
const existingNewer = computed(() => !!incomingMTime.value && !!existingMTime.value && existingMTime.value > incomingMTime.value)
const incomingLarger = computed(() => incomingSize.value !== undefined && existingSize.value !== undefined && incomingSize.value > existingSize.value)
const existingLarger = computed(() => incomingSize.value !== undefined && existingSize.value !== undefined && existingSize.value > incomingSize.value)

watch(() => props.existing, async () => {
	existingMTime.value = getMTime(props.existing)
	existingSize.value = getSize(props.existing)
	existingPreview.value = await getPreview(props.existing)
})

watch(() => props.incoming, async () => {
	const file = await getFileOrNode(props.incoming)
	if (file === null) {
		return
	}

	incomingMTime.value = getMTime(file)
	incomingSize.value = getSize(file)
	incomingPreview.value = await getPreview(file)
})

/**
 * If the input is a filesystem file entry the file is loaded and returned.
 * In case of a directory null is returned.
 * Otherwise the INode or File is returned.
 *
 * @param input - The conflict input
 */
async function getFileOrNode(input: ConflictInput): Promise<File | INode | null> {
	if (isFileSystemFileEntry(input)) {
		return await new Promise((resolve, reject) => input.file(resolve, reject))
	} else if (isFileSystemEntry(input)) {
		return null
	}
	return input
}

/**
 * Get the filesize if available.
 *
 * @param input - The input file or node
 */
function getSize(input: INode | File): number | undefined {
	return input.size
}

/**
 * Get the mtime if available.
 *
 * @param input - The input file or node
 */
function getMTime(input: INode | File): Date | undefined {
	if (input instanceof File) {
		const mtime = input.lastModified
		if (mtime > 0) {
			return new Date(mtime)
		}
	} else {
		return input.mtime
	}
}

/**
 * Get the preview url if possible.
 * For INode the server preview endpoint is used, for files a data URL is generated.
 *
 * @param input - The input file or node
 */
async function getPreview(input: INode | File): Promise<string | undefined> {
	if (input instanceof File) {
		return await getFilePreview(input)
	}
	return getPreviewURL(input, { size: PREVIEW_SIZE })?.toString()
}

/**
 * Get a object url for a local file.
 *
 * @param file - The input file
 */
async function getFilePreview(file: File): Promise<string | undefined> {
	if (!file.type.startsWith('image/')) {
		return undefined
	}

	const { resolve, promise } = Promise.withResolvers<string | undefined>()
	const reader = new FileReader()
	reader.onload = async (e) => {
		const result = e?.target?.result
		if (result instanceof ArrayBuffer) {
			const blob = new Blob([result], { type: file.type })
			const url = URL.createObjectURL(blob)
			resolve(url)
			return
		}
		resolve(undefined)
	}
	reader.readAsArrayBuffer(file)
	return promise
}

/**
 * Check the validitiy of the conflict resolution
 */
function validate() {
	validationMessage.value = !incomingSelected.value && !existingSelected.value
		? t('You need to choose at least one conflict solution')
		: ''
}
</script>

<template>
	<fieldset :class="$style.pickerEntry">
		<legend>{{ existing.displayname }}</legend>

		<!-- Existing version (left) -->
		<NcCheckboxRadioSwitch
			v-if="!isSingle"
			v-model="existingSelected"
			:class="$style.pickerEntryColumn"
			:error="!!validationMessage"
			:helperText="validationMessage"
			:required="!conflictResolved">
			<ConflictPickerCard
				:preview="existingPreview"
				:mtime="existingMTime"
				:size="existingSize"
				:isFolder="isExistingFolder"
				:label="t('Existing version')"
				:boldDate="existingNewer"
				:boldSize="existingLarger" />
		</NcCheckboxRadioSwitch>
		<ConflictPickerCard
			v-else
			:class="$style.pickerEntryColumn"
			:preview="existingPreview"
			:mtime="existingMTime"
			:size="existingSize"
			:isFolder="isExistingFolder"
			:label="t('Existing version')"
			:boldDate="existingNewer"
			:boldSize="existingLarger" />

		<!-- Arrow pointing from the existing to the new version -->
		<NcIconSvgWrapper
			:class="$style.pickerEntryArrow"
			directional
			:path="mdiArrowRight" />

		<!-- New version (right) -->
		<NcCheckboxRadioSwitch
			v-if="!isSingle"
			v-model="incomingSelected"
			:class="$style.pickerEntryColumn"
			:error="!!validationMessage"
			:helperText="validationMessage"
			:required="!conflictResolved">
			<ConflictPickerCard
				:preview="incomingPreview"
				:mtime="incomingMTime"
				:size="incomingSize"
				:isFolder="isIncomingFolder"
				:label="t('New version')"
				:boldDate="incomingNewer"
				:boldSize="incomingLarger" />
		</NcCheckboxRadioSwitch>
		<ConflictPickerCard
			v-else
			:class="$style.pickerEntryColumn"
			:preview="incomingPreview"
			:mtime="incomingMTime"
			:size="incomingSize"
			:isFolder="isIncomingFolder"
			:label="t('New version')"
			:boldDate="incomingNewer"
			:boldSize="incomingLarger" />
	</fieldset>
</template>

<style module lang="scss">
.pickerEntry {
	display: grid;
	align-items: center;
	grid-template-columns: 1fr var(--arrow-column) 1fr;

	// last fieldset does not have a border
	&:not(:last-of-type) {
		border-bottom: 1px solid var(--color-border);
	}

	legend {
		// span the full row above the two columns
		grid-column: 1 / -1;
		// the legend names the file both versions belong to
		font-weight: bold;
	}
}

.pickerEntryArrow {
	justify-self: center;
	color: var(--color-text-maxcontrast);
}
</style>
