<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { mdiFile, mdiFolder } from '@mdi/js'
import { formatFileSize } from '@nextcloud/files'
import { computed, ref, watch } from 'vue'
import NcDateTime from '@nextcloud/vue/components/NcDateTime'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import { t } from '../../utils/l10n.ts'

const props = defineProps<{
	/**
	 * Preview URL, if available
	 */
	preview?: string

	/**
	 * Modification time, if available
	 */
	mtime?: Date

	/**
	 * File size in bytes, if available
	 */
	size?: number

	/**
	 * Whether the node is a folder (changes the fallback icon)
	 */
	isFolder: boolean

	/**
	 * Visually hidden label describing this side ("Existing version"/"New version").
	 * Kept for screen readers as the column heading already labels it visually.
	 */
	label: string

	/**
	 * Bold the modification time (it is the more recent one)
	 */
	boldDate?: boolean

	/**
	 * Bold the size (it is the larger one)
	 */
	boldSize?: boolean
}>()

// Previews can 404, fall back to the icon instead of a broken image
const previewFailed = ref(false)
watch(() => props.preview, () => {
	previewFailed.value = false
})
const showPreview = computed(() => !!props.preview && !previewFailed.value)
</script>

<template>
	<span :class="$style.card">
		<!-- Icon or preview -->
		<NcIconSvgWrapper
			v-if="!showPreview"
			:class="[$style.cardIcon, { [$style.cardIcon_folder]: isFolder }]"
			:path="isFolder ? mdiFolder : mdiFile"
			:size="48" />
		<img
			v-else
			:class="$style.cardPreview"
			:src="preview"
			alt=""
			loading="lazy"
			@error="previewFailed = true">

		<!-- Description -->
		<span :class="$style.cardDescription">
			<NcDateTime
				v-if="mtime"
				:class="{ [$style.bold]: boldDate }"
				:timestamp="mtime"
				:relativeTime="false"
				:format="{ timeStyle: 'short', dateStyle: 'medium' }" />
			<span v-else>
				{{ t('Last modified date unknown') }}
			</span>
			<span v-if="size !== undefined" :class="{ [$style.bold]: boldSize }">
				{{ formatFileSize(size) }}
			</span>
		</span>

		<span class="hidden-visually">{{ label }}</span>
	</span>
</template>

<style module lang="scss">
$height: 64px;

.card {
	display: flex;
	align-items: center;
	height: $height;
}

.cardIcon,
.cardPreview {
	height: $height;
	width: $height;
	margin: 0 var(--secondary-margin);
	display: block;
	flex: 0 0 $height;
}

.cardIcon {
	color: var(--color-text-maxcontrast);
}

.cardIcon_folder {
	color: var(--color-primary-element);
}

.cardPreview {
	overflow: hidden;
	border-radius: calc(var(--border-radius) * 2);
	object-fit: cover;
}

.cardDescription {
	display: flex;
	flex-direction: column;
	min-width: 0;

	span,
	:deep(time) {
		white-space: nowrap;
	}
}

.bold {
	font-weight: bold;
}
</style>
