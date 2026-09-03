/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { INode } from '@nextcloud/files'
import type { MaybeRef } from 'vue'

import { FileType } from '@nextcloud/files'
import { generateUrl } from '@nextcloud/router'
import { ref, toValue, watchEffect } from 'vue'
import { preloadImage } from '../utils/imagePreload.ts'

/**
 * CSS custom property controlling FilePicker thumbnail size.
 * Override on `:root` (e.g. via instance theming) to change size without a public API.
 */
const FILE_PICKER_PREVIEW_SIZE_VAR = '--file-picker-preview-size'

/** Default FilePicker thumbnail size in pixels when the CSS variable is unset. */
const FILE_PICKER_PREVIEW_SIZE_DEFAULT = 32

/**
 * Resolve the FilePicker preview size from `:root` CSS (or the default).
 * Used only for preview *request* resolution so fetched images match display size.
 */
function getFilePickerPreviewSize(): number {
	if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
		return FILE_PICKER_PREVIEW_SIZE_DEFAULT
	}

	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(FILE_PICKER_PREVIEW_SIZE_VAR)
		.trim()
	const parsed = Number.parseFloat(raw)
	if (Number.isFinite(parsed) && parsed > 0) {
		return Math.round(parsed)
	}

	return FILE_PICKER_PREVIEW_SIZE_DEFAULT
}

interface PreviewOptions {
	/**
	 * Size of the previews in px.
	 * When omitted, uses `--file-picker-preview-size` from CSS (default 32).
	 *
	 * @default value of `--file-picker-preview-size` or 32
	 */
	size?: number
	/**
	 * Should the preview fall back to the mime type icon
	 *
	 * @default true
	 */
	mimeFallback?: boolean
	/**
	 * Should the preview be cropped or fitted
	 *
	 * @default false (meaning it gets fitted)
	 */
	cropPreview?: boolean
}

/**
 * Generate the preview URL of a file node
 *
 * @param node The node to generate the preview for
 * @param options Preview options
 */
export function getPreviewURL(node: INode, options: PreviewOptions = {}) {
	options = {
		cropPreview: false,
		mimeFallback: true,
		...options,
		// Keep request resolution in sync with CSS display size (avoids blurry upscales)
		size: options.size ?? getFilePickerPreviewSize(),
	}

	try {
		const previewUrl = node.attributes?.previewUrl
			|| generateUrl('/core/preview?fileId={fileid}', {
				fileid: node.fileid,
			})

		let url
		try {
			url = new URL(previewUrl)
		} catch {
			url = new URL(previewUrl, window.location.origin)
		}

		// Request preview with params
		url.searchParams.set('x', `${options.size}`)
		url.searchParams.set('y', `${options.size}`)
		url.searchParams.set('mimeFallback', `${options.mimeFallback}`)

		// Handle cropping
		url.searchParams.set('a', options.cropPreview === true ? '0' : '1')

		// cache busting
		url.searchParams.set('c', `${node.attributes.etag}`)
		return url
	} catch {
		return null
	}
}

/**
 * @param node - The node to get the preview of
 * @param options - Preview options
 */
export function usePreviewURL(node: MaybeRef<INode>, options?: MaybeRef<PreviewOptions>) {
	const previewURL = ref<URL | null>(null)
	const previewLoaded = ref(false)

	watchEffect(() => {
		previewLoaded.value = false
		previewURL.value = getPreviewURL(toValue(node), toValue(options || {}))
		if (previewURL.value && toValue(node).type === FileType.File) {
			preloadImage(previewURL.value.href).then((success: boolean) => {
				previewLoaded.value = success
			})
		}
	})

	return {
		previewURL,
		previewLoaded,
	}
}
