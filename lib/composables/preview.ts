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

interface PreviewOptions {
	/**
	 * Size of the previews in px.
	 * Snapped to backend-pregenerated sizes (64 or 256); display size is controlled via CSS.
	 *
	 * @default from `--file-picker-preview-size` (≤64 → 64, >64 → 256)
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
		// Only request pregenerated sizes so large folders do not flood the preview generator
		size: toPregeneratedPreviewSize(options.size ?? getFilePickerPreviewRequestSize()),
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

/**
 * CSS custom property controlling FilePicker thumbnail *display* size.
 * Override on `:root` (e.g. via instance theming) to change size without a public API.
 */
const FILE_PICKER_PREVIEW_SIZE_VAR = '--file-picker-preview-size'

/** Backend-pregenerated preview sizes (cheap to serve). */
const PREGENERATED_PREVIEW_SIZE_SMALL = 64
const PREGENERATED_PREVIEW_SIZE_LARGE = 256

/**
 * Cached snapped preview *request* size (64 or 256).
 * CSS is read once — display size does not change at runtime.
 */
let previewRequestSize: number | undefined

/**
 * Map a display size to a backend-pregenerated request size.
 * size ≤ 64 → 64, size > 64 → 256 (avoids generating arbitrary preview sizes).
 *
 * @param size - Desired display or request size in px
 */
function toPregeneratedPreviewSize(size: number): number {
	return size <= PREGENERATED_PREVIEW_SIZE_SMALL
		? PREGENERATED_PREVIEW_SIZE_SMALL
		: PREGENERATED_PREVIEW_SIZE_LARGE
}

/**
 * Resolve the preview request size from CSS display size (once), snapped to 64 or 256.
 */
function getFilePickerPreviewRequestSize(): number {
	if (previewRequestSize !== undefined) {
		return previewRequestSize
	}

	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(FILE_PICKER_PREVIEW_SIZE_VAR)
		.trim()
	const parsed = Number.parseFloat(raw)
	const displaySize = Number.isFinite(parsed) && parsed > 0
		? Math.round(parsed)
		: PREGENERATED_PREVIEW_SIZE_SMALL

	previewRequestSize = toPregeneratedPreviewSize(displaySize)
	return previewRequestSize
}
