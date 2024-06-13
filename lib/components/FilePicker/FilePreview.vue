<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div :style="canLoadPreview ? { backgroundImage: `url(${previewURL})`} : undefined"
		:class="fileListIconStyles['file-picker__file-icon']">
		<template v-if="!canLoadPreview">
			<IconFile v-if="isFile" :size="20" />
			<IconFolder v-else :size="20" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { FileType, type Node } from '@nextcloud/files'
import { computed, ref, watchEffect } from 'vue'
import { getPreviewURL } from '../../composables/preview'

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

const previewURL = computed(() => getPreviewURL(props.node, { cropPreview: props.cropImagePreviews }))

const isFile = computed(() => props.node.type === FileType.File)
const canLoadPreview = ref(false)

watchEffect(() => {
	canLoadPreview.value = false

	if (previewURL.value) {
		const loader = new Image()
		loader.src = previewURL.value.href
		loader.onerror = () => loader.remove()
		loader.onload = () => { canLoadPreview.value = true; loader.remove() }
	}
})
</script>

<script lang="ts">
export default {
	name: 'FilePreview',
}
</script>
