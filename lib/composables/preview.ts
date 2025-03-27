/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { INode } from '@nextcloud/files'
import type { MaybeRef } from '@vueuse/core'

import { generateUrl } from '@nextcloud/router'
import { toValue } from '@vueuse/core'
import { ref, watchEffect } from 'vue'
import { preloadImage } from '../utils/imagePreload'

interface PreviewOptions {
	/**
	 * Size of the previews in px
	 * @default 32
	 */
	size?: number
	/**
	 * Should the preview fall back to the mime type icon
	 * @default true
	 */
	mimeFallback?: boolean
	/**
	 * Should the preview be cropped or fitted
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
	options = { size: 32, cropPreview: false, mimeFallback: true, ...options }

	try {
		const previewUrl = node.attributes?.previewUrl
			|| generateUrl('/core/preview?fileId={fileid}', {
				fileid: node.fileid,
			})

		let url
		try {
			url = new URL(previewUrl)
		} catch (e) {
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
	} catch (e) {
		return null
	}
}

export const usePreviewURL = (node: MaybeRef<INode>, options?: MaybeRef<PreviewOptions>) => {
	const previewURL = ref<URL|null>(null)
	const previewLoaded = ref(false)

	watchEffect(() => {
		previewLoaded.value = false
		previewURL.value = getPreviewURL(toValue(node), toValue(options || {}))
		if (previewURL.value) {
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
