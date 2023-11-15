<template>
	<div :style="canLoadPreview ? { backgroundImage: `url(${previewURL})`} : undefined"
		:aria-label="t('MIME type {mime}', { mime: node.mime || t('unknown') })"
		:class="fileListIconStyles['file-picker__file-icon']">
		<template v-if="!canLoadPreview">
			<IconFile v-if="isFile" :size="20" />
			<IconFolder v-else :size="20" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { FileType, type Node } from '@nextcloud/files'
import { computed, ref, watch } from 'vue'
import { getPreviewURL } from '../../composables/preview'
import { t } from '../../utils/l10n'

import IconFile from 'vue-material-design-icons/File.vue'
import IconFolder from 'vue-material-design-icons/Folder.vue'

// CSS modules
import fileListIconStylesModule from './FileListIcon.module.scss'
// workaround for vue2.7 bug, can be removed with vue3
const fileListIconStyles = ref(fileListIconStylesModule)

const props = defineProps<{
	node: Node
	cropImagePreviews: Boolean
}>()

const previewURL = computed(() => getPreviewURL(props.node, { cropPreview: cropImagePreviews.value }))

const isFile = computed(() => props.node.type === FileType.File)
const canLoadPreview = ref(false)

watch(previewURL, () => {
	canLoadPreview.value = false

	if (previewURL.value) {
		const loader = document.createElement('img')
		loader.src = previewURL.value.href
		loader.onerror = () => loader.remove()
		loader.onload = () => { canLoadPreview.value = true; loader.remove() }
		document.body.appendChild(loader)
	}
}, { immediate: true })
</script>

<script lang="ts">
export default {
	name: 'FilePreview',
}
</script>
