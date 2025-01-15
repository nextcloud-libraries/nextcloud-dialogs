<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div :style="previewLoaded ? { backgroundImage: `url(${previewURL})`} : undefined"
		:class="fileListIconStyles['file-picker__file-icon']">
		<template v-if="!previewLoaded">
			<IconFile v-if="isFile" :size="20" />
			<component :is="folderDecorationIcon" v-else-if="folderDecorationIcon"/>
			<IconFolder v-else :size="20" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { FileType, type Node } from '@nextcloud/files'
import { computed, ref, toRef } from 'vue'
import { usePreviewURL } from '../../composables/preview'

import IconFile from 'vue-material-design-icons/File.vue'
import IconFolder from 'vue-material-design-icons/Folder.vue'
import LockIcon from 'vue-material-design-icons/Lock.vue'
import TagIcon from 'vue-material-design-icons/Tag.vue'
import LinkIcon from 'vue-material-design-icons/Link.vue'
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus.vue'
import NetworkIcon from 'vue-material-design-icons/Network.vue'
import AccountGroupIcon from 'vue-material-design-icons/AccountGroup.vue'

// CSS modules
import fileListIconStylesModule from './FileListIcon.module.scss'

// workaround for vue2.7 bug, can be removed with vue3
const fileListIconStyles = ref(fileListIconStylesModule)

const props = defineProps<{
	node: Node
	cropImagePreviews: boolean
}>()

const {
	previewURL,
	previewLoaded,
} = usePreviewURL(toRef(props, 'node'), computed(() => ({ cropPreview: props.cropImagePreviews })))

const isFile = computed(() => props.node.type === FileType.File)
const folderDecorationIcon = computed(() => {
	if (props.node.type !== FileType.Folder) {
		return null
	}

	// Encrypted folders
	if (props.node.attributes?.['is-encrypted'] === 1) {
		return LockIcon
	}

	// System tags
	if (props.node.attributes?.['is-tag']) {
		return TagIcon
	}

	// Link and mail shared folders
	const shareTypes = Object.values(props.node.attributes?.['share-types'] || {}).flat() as number[]
	if (shareTypes.some(type => type === ShareType.Link || type === ShareType.Email)) {
		return LinkIcon
	}

	// Shared folders
	if (shareTypes.length > 0) {
		return AccountPlusIcon
	}

	switch (props.node.attributes?.['mount-type']) {
		case 'external':
		case 'external-session':
			return NetworkIcon
		case 'group':
			return AccountGroupIcon
		case 'shared':
			return AccountPlusIcon
	}

	return null

})
</script>

<script lang="ts">
export default {
	name: 'FilePreview',
}
</script>
