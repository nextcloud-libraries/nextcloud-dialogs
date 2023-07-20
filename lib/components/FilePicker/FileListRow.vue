<template>
	<tr tabindex="0"
		class="file-picker__row"
		@click="handleClick"
		@key-down="handleKeyDown">
		<td class="row-checkbox">
			<NcCheckboxRadioSwitch :disabled="!isPickable"
				:checked="selected"
				:aria-label="t('Select the row for {nodename}', { nodename: displayName })"
				@update:checked="toggleSelected" />
		</td>
		<td class="row-name">
			<div class="file-picker__name-container">
				<div class="file-picker__file-icon" :style="{ backgroundImage }" />
				<div class="file-picker__file-name" v-text="displayName" />
			</div>
		</td>
		<td class="row-size">
			{{ formatFileSize(node.size || 0) }}
		</td>
		<td class="row-modified">
			<NcDatetime :timestamp="node.mtime" :ignore-seconds="true" />
		</td>
	</tr>
</template>
<script setup lang="ts">
import NcCheckboxRadioSwitch from '@nextcloud/vue/dist/Components/NcCheckboxRadioSwitch.js'
import NcDatetime from '@nextcloud/vue/dist/Components/NcDatetime.js'

import { type Node, formatFileSize } from '@nextcloud/files'
import { computed } from 'vue'
import { t } from '../../l10n'

const props = defineProps<{
	/** Can directories be picked */
	allowPickDirectory: boolean
	/** Is this node currently selected */
	selected: boolean
	/** Whether the node can be picked */
	canPick: boolean
	/** The current node */
	node: Node
}>()

const emit = defineEmits<{
	/** Emitted when the selected state is changed */
	(e: 'update:selected', v: boolean): void
	/** Emitted when a directory was not selected but entered */
	(e: 'enter-directory', node: Node): void
}>()

/**
 * The displayname of the current node
 */
const displayName = computed(() => props.node.attributes?.displayname || props.node.basename)

/**
 * If this node can be picked, basically just check if picking a directory is allowed
 */
const isPickable = computed(() => props.canPick && (props.allowPickDirectory || props.node.mime !== 'httpd/unix-directory'))

/**
 * Background image url for the given nodes mime type
 */
const backgroundImage = computed(() => `url(${window.OC.MimeType.getIconUrl(props.node.mime)})`)

/**
 * Toggle the selection state
 */
function toggleSelected() {
	emit('update:selected', !props.selected)
}

/**
 * Handle clicking the table row, if it is a directory it is opened, else selected
 */
function handleClick() {
	if (props.node.mime === 'httpd/unix-directory') {
		emit('enter-directory', props.node)
	} else {
		toggleSelected()
	}
}

/**
 * Handle keydown on the table row, pressing the enter key will be similar to clicking for keyboard navigation
 * @param event The Keydown event
 */
function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'enter') {
		handleClick()
	}
}
</script>

<style scoped lang="scss">
@use './FileList.scss';

.file-picker {
	&__name-container {
		display: flex;
		justify-content: start;
		align-items: center;
		height: 100%;
	}

	&__file-icon {
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
		background-repeat: no-repeat;
		background-size: contain;
	}

	&__file-name {
		padding-inline-start: 6px;
	}
}
</style>
