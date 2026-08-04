<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { INode } from '@nextcloud/files'
import type { ConflictInput, ConflictResolutionResult } from '../../conflict-picker.ts'

import { mdiArrowRight } from '@mdi/js'
import { basename } from '@nextcloud/paths'
import { computed, shallowRef, useTemplateRef } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import ConflictPickerEntry from './ConflictPickerEntry.vue'
import { showError } from '../../toast.ts'
import { n, t } from '../../utils/l10n.ts'
import { logger } from '../../utils/logger.ts'

const props = defineProps<{
	/**
	 * Container for the dialog
	 */
	container?: string | undefined

	/**
	 * Directory with the conflicts, its name is shown in the description
	 */
	dirname?: string

	/**
	 * The existing nodes (same names as the conflicts)
	 */
	existing: INode[]

	/**
	 * The incoming nodes with conflicting names compared to `existing`
	 */
	incoming: ConflictInput[]

	/**
	 * If set to true no hint about overwriting directory content will be shown
	 */
	recursiveUpload?: boolean

	/**
	 * If set tot true a hint is shown that any folder content will be overwritten
	 */
	isOverwriting?: boolean
}>()

const emit = defineEmits<{
	close: [result: ConflictResolutionResult<ConflictInput> | null]
}>()

const blockedTitle = t('You need to select at least one version of each file to continue.')

const formElement = useTemplateRef('form')
const conflictEntries = useTemplateRef('conflictEntry')

const isSingle = computed(() => props.incoming.length === 1)

// Preselect the new files so the user can continue right away.
const newSelected = shallowRef<ConflictInput[]>([...props.incoming])
const oldSelected = shallowRef<ConflictInput[]>([])

const isNoNewSelected = computed(() => newSelected.value.length === 0)
const areAllNewSelected = computed(() => newSelected.value.length === props.incoming.length)
const areSomeNewSelected = computed(() => !areAllNewSelected.value && !isNoNewSelected.value)
const areAllOldSelected = computed(() => oldSelected.value.length === props.existing.length)
const areSomeOldSelected = computed(() => !areAllOldSelected.value && !isNoNewSelected.value)
const areConflictsResolved = computed(() => {
	for (const conflict of props.incoming) {
		if (oldSelected.value.includes(conflict) || newSelected.value.includes(conflict)) {
			continue
		}
		return false
	}
	return true
})

const dialogName = computed(() => isSingle.value
	? t('Select file to keep')
	: t('Select files to keep'))

// Only the folder name, the root folder is called "All files" in the Files app
const folderName = computed(() => basename(props.dirname ?? '') || t('All files'))

// Split on the placeholder so the folder name can be shown in bold
const descriptionParts = computed(() => {
	const message = isSingle.value
		? t('An item with the same name already exists in {dirname}.')
		: t('Items with the same name already exist in {dirname}, select which to keep.')
	const [before, after = ''] = message.split('{dirname}')
	return { before, after }
})

/**
 * Cancel the conflic resolution (closing the dialog)
 */
function onCancel() {
	emit('close', null)
}

/**
 * Single-file: replace the existing file with the new one.
 */
function onReplace() {
	emit('close', {
		selected: [...props.incoming],
		renamed: [],
		skipped: [],
	})
}

/**
 * Single-file: keep both, the new file is uploaded with a renamed copy.
 */
function onKeepBoth() {
	emit('close', {
		selected: [],
		renamed: [...props.incoming],
		skipped: [],
	})
}

/**
 * Skip all conflicts (no upload will be performed)
 */
function onSkipAll() {
	logger.debug('Conflict skipped. Ignoring all conflicting files')
	emit('close', {
		selected: [],
		renamed: [],
		skipped: [...props.incoming],
	})
}

/**
 * @param selected - The toggle state
 */
function onSelectAllNew(selected: boolean) {
	if (selected) {
		logger.debug('Selected all new files')
		newSelected.value = [...props.incoming]
	} else {
		logger.debug('Cleared new selection')
		newSelected.value = []
	}
}

/**
 * @param selected - The toggle state
 */
function onSelectAllOld(selected: boolean) {
	if (selected) {
		logger.debug('Selected all existing files')
		oldSelected.value = [...props.incoming]
	} else {
		logger.debug('Cleared old selection')
		oldSelected.value = []
	}
}

/**
 * @param conflict - The conflict that should be skipped
 */
function toggleOldSelected(conflict: ConflictInput) {
	if (oldSelected.value.includes(conflict)) {
		oldSelected.value = oldSelected.value.filter((entry) => entry !== conflict)
	} else {
		oldSelected.value = [...oldSelected.value, conflict]
	}
}

/**
 * @param conflict - The conflict where the incoming node should be used
 */
function toggleNewSelected(conflict: ConflictInput) {
	if (newSelected.value.includes(conflict)) {
		newSelected.value = newSelected.value.filter((entry) => entry !== conflict)
	} else {
		newSelected.value = [...newSelected.value, conflict]
	}
}

/**
 * Handle submit by validating all conflict resolutions
 */
function onSubmit() {
	if (!areConflictsResolved.value) {
		for (const entry of conflictEntries.value!) {
			entry!.validate()
		}

		formElement.value!.reportValidity()
		showError(blockedTitle)
		return
	}

	const selected = newSelected.value.filter((entry) => !oldSelected.value.includes(entry))
	const renamed = newSelected.value.filter((entry) => oldSelected.value.includes(entry))
	const skipped = oldSelected.value.filter((entry) => !newSelected.value.includes(entry))

	emit('close', {
		renamed,
		selected,
		skipped,
	})
}
</script>

<template>
	<NcDialog
		:container
		:class="$style.picker"
		:name="dialogName"
		size="large"
		@closing="onCancel">
		<!-- Header -->
		<div :class="$style.pickerHeader">
			<!-- Description -->
			<p id="conflict-picker-description" :class="$style.pickerDescription">
				{{ descriptionParts.before }}<strong>{{ folderName }}</strong>{{ descriptionParts.after }}<br>
				<template v-if="!isSingle">
					{{ t('Existing files and folders will be deleted if not selected. If both are chosen, they will be renamed.') }}<br>
				</template>
				<template v-if="recursiveUpload">
					{{ t('When a new folder is selected, the content is written into the existing folder and a recursive conflict resolution is performed.') }}
				</template>
				<template v-else-if="isOverwriting">
					{{ t('When a new folder is selected, any files within it will also be overwritten.') }}
				</template>
				<template v-else>
					{{ t('When a new folder is selected, any conflicting files within it will also be overwritten.') }}
				</template>
			</p>
		</div>

		<!-- Main form and conflict picker -->
		<form
			ref="form"
			aria-labelledby="conflict-picker-description"
			:class="$style.pickerForm"
			@submit.prevent.stop="onSubmit">
			<!-- Column headings / select all checkboxes (only useful with multiple files) -->
			<fieldset v-if="!isSingle" :class="$style.pickerSelectAll">
				<legend class="hidden-visually">
					{{ t('Select all checkboxes') }}
				</legend>
				<NcCheckboxRadioSwitch
					:modelValue="areAllOldSelected"
					:indeterminate="areSomeOldSelected"
					@update:modelValue="onSelectAllOld">
					{{ t('Existing files') }}
				</NcCheckboxRadioSwitch>
				<span />
				<NcCheckboxRadioSwitch
					:modelValue="areAllNewSelected"
					:indeterminate="areSomeNewSelected"
					@update:modelValue="onSelectAllNew">
					{{ t('New files') }}
				</NcCheckboxRadioSwitch>
			</fieldset>

			<!-- Files loop -->
			<ConflictPickerEntry
				v-for="(node, index) in existing"
				ref="conflictEntry"
				:key="node.fileid"
				:isSingle="isSingle"
				:incoming="incoming[index]!"
				:existing="node"
				:incomingSelected="newSelected.includes(incoming[index]!)"
				:existingSelected="oldSelected.includes(incoming[index]!)"
				@update:existingSelected="toggleOldSelected(incoming[index]!)"
				@update:incomingSelected="toggleNewSelected(incoming[index]!)" />
		</form>

		<!-- Controls -->
		<template #actions>
			<!-- Cancel the entire operation -->
			<NcButton
				:title="t('Cancel the entire operation')"
				data-cy-conflict-picker-cancel
				variant="tertiary"
				@click="onCancel">
				{{ t('Cancel') }}
			</NcButton>

			<!-- Align right -->
			<span :class="$style.pickerActionSeparator" />

			<!-- Single file: keep both or replace -->
			<template v-if="isSingle">
				<NcButton variant="secondary" @click="onKeepBoth">
					{{ t('Keep both') }}
				</NcButton>
				<NcButton variant="primary" @click="onReplace">
					{{ t('Replace') }}
				</NcButton>
			</template>

			<!-- Multiple files: skip all or continue with the selection -->
			<template v-else>
				<NcButton @click="onSkipAll">
					{{ n('Skip %n file', 'Skip %n files', incoming.length) }}
				</NcButton>
				<NcButton
					:aria-disabled="!areConflictsResolved"
					:class="[
						$style.pickerActionSubmit,
						{
							[$style.pickerActionSubmit_disabled]: !areConflictsResolved,
						},
					]"
					:title="areConflictsResolved ? '' : blockedTitle"
					type="submit"
					variant="primary"
					@click.stop.prevent="onSubmit">
					<template #icon>
						<NcIconSvgWrapper directional :path="mdiArrowRight" />
					</template>
					{{ t('Continue') }}
					<span v-if="!areConflictsResolved" class="hidden-visually">{{ blockedTitle }}</span>
				</NcButton>
			</template>
		</template>
	</NcDialog>
</template>

<style module lang="scss">
.picker {
	--margin: 36px;
	--secondary-margin: 18px;
	// shared width of the middle arrow column, so headings and entries line up
	--arrow-column: 44px;

	:global(.dialog__actions) {
		// Match the whitespace the buttons have on the sides
		margin-block-end: calc(var(--default-grid-baseline) * 6);
	}
}

// Keeps the cancel button on the start side, all other actions stay at the end
.pickerActionSeparator {
	margin-inline-start: auto;
}

.pickerHeader {
	position: sticky;
	z-index: 10;
	top: 0;
	padding: 0 var(--margin);
	padding-bottom: var(--secondary-margin);
	background-color: var(--color-main-background);
}

.pickerForm {
	position: relative;
	overflow: auto;
	padding: 0 var(--margin);
	// overlap header bottom padding
	margin-top: calc(-1 * var(--secondary-margin));
}

.pickerActionSubmit_disabled {
	opacity: 0.7;
	filter: saturate(50%);
}

.pickerSelectAll {
	display: grid;
	width: 100%;
	margin-top: calc(var(--secondary-margin) * 1.5);
	padding-bottom: var(--secondary-margin);
	grid-template-columns: 1fr var(--arrow-column) 1fr;
	align-items: center;

	legend {
		display: flex;
		align-items: center;
		grid-column: 1 / -1;
		width: 100%;
		margin-bottom: calc(var(--secondary-margin) / 2);
	}

	&.conflict-picker__all {
		position: sticky;
		top: 0;
		margin: 0;
		padding: var(--secondary-margin) 0;
		background-image: linear-gradient(to top, transparent, var(--color-main-background-blur) 10%, var(--color-main-background) 15%);
		// Proper select all checkboxes alignment
		& + fieldset {
			margin-top: 0;
		}

		:deep(label) {
			font-weight: bold;
		}
	}
}
</style>
