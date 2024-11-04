<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div :style="previewLoaded ? { backgroundImage: `url(${previewURL})`} : undefined"
		:class="fileListIconStyles['file-picker__file-icon']">
		<template v-if="!previewLoaded">
			<IconFile v-if="isFile" :size="20" />
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
</script>

<script lang="ts">
export default {
	name: 'FilePreview',
}
</script>
