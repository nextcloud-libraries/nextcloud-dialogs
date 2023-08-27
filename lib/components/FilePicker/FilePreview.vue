<template>
	<div :style="canLoadPreview ? { backgroundImage: `url(${previewURL})`} : undefined"
		:aria-label="t('Mime type {mime}', { mime: node.mime || t('unknown') })"
		class="file-picker__file-icon">
		<template v-if="!canLoadPreview">
			<IconFile v-if="isFile" :size="20" />
			<IconFolder v-else :size="20" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { FileType, type Node } from '@nextcloud/files'
import { usePreviewURL } from '../../usables/preview'
import { computed, ref, toRef, watch } from 'vue'
import { t } from '../../utils/l10n'

import IconFile from 'vue-material-design-icons/File.vue'
import IconFolder from 'vue-material-design-icons/Folder.vue'

const props = defineProps<{
	node: Node
}>()

const { previewURL } = usePreviewURL(toRef(props, 'node'))

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

<style scoped lang="scss">
.file-picker__file-icon {
	width: 32px;
	height: 32px;
	min-width: 32px;
	min-height: 32px;
	background-repeat: no-repeat;
	background-size: contain;
	// for the fallback
	display: flex;
	justify-content: center;
}
</style>
