/**
 * @copyright Copyright (c) 2023 Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import type { Node } from '@nextcloud/files'
import type { Ref } from 'vue'

import { generateUrl } from '@nextcloud/router'
import { toValue } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

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
export function getPreviewURL(node: Node, options: PreviewOptions = {}) {
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

export const usePreviewURL = (node: Node | Ref<Node>, options?: PreviewOptions | Ref<PreviewOptions>) => {
	const previewURL = ref<URL|null>(null)

	watchEffect(() => {
		previewURL.value = getPreviewURL(toValue(node), toValue(options || {}))
	})

	return {
		previewURL,
	}
}
