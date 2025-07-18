<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div
		:style="previewLoaded ? { backgroundImage: `url(${previewURL})` } : undefined"
		:class="fileListIconStyles['file-picker__file-icon']">
		<template v-if="!previewLoaded">
			<IconFile v-if="isFile" :size="32" />
			<template v-else>
				<NcIconSvgWrapper
					v-if="folderDecorationIcon"
					:class="fileListIconStyles['file-picker__file-icon-overlay']"
					inline
					:path="folderDecorationIcon"
					:size="16" />
				<IconFolder
					:class="fileListIconStyles['file-picker__file-icon--primary']"
					:size="32" />
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { INode } from '@nextcloud/files'

import { mdiAccountPlus, mdiGroup, mdiLink, mdiLock, mdiNetwork, mdiTag } from '@mdi/js'
import { FileType } from '@nextcloud/files'
import { ShareType } from '@nextcloud/sharing'
import { computed, ref, toRef } from 'vue'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import IconFile from 'vue-material-design-icons/File.vue'
import IconFolder from 'vue-material-design-icons/Folder.vue'
import { usePreviewURL } from '../../composables/preview.ts'

// CSS modules
import fileListIconStylesModule from './FileListIcon.module.scss'

const props = defineProps<{
	/**
	 * Node to show preview of
	 */
	node: INode
	/**
	 * Crop the preview to fit the container or preserve original aspect ratio
	 */
	cropImagePreviews: boolean
}>()

// workaround for vue2.7 bug, can be removed with vue3
const fileListIconStyles = ref(fileListIconStylesModule)

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
		return mdiLock
	}

	// System tags
	if (props.node.attributes?.['is-tag']) {
		return mdiTag
	}

	// Link and mail shared folders
	const shareTypes = Object.values(props.node.attributes?.['share-types'] || {}).flat() as number[]
	if (shareTypes.some((type) => type === ShareType.Link || type === ShareType.Email)) {
		return mdiLink
	}

	// Shared folders
	if (shareTypes.length > 0) {
		return mdiAccountPlus
	}

	switch (props.node.attributes?.['mount-type']) {
		case 'external':
		case 'external-session':
			return mdiNetwork
		case 'group':
			return mdiGroup
		case 'shared':
			return mdiAccountPlus
	}

	return null
})
</script>
