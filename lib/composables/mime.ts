/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { ComputedRef, Ref } from 'vue'

import { computed } from 'vue'

/**
 * Create a filter function for MIME types
 * The filter function supports MIME type filters with wildcards
 *
 * @param allowedMIMETypes Reference to allowed MIME types
 */
export function useMimeFilter(allowedMIMETypes: Ref<readonly string[]> | ComputedRef<readonly string[]>) {
	// Cache splitted MIME types
	const splittedTypes = computed(() => allowedMIMETypes.value.map((filter) => filter.split('/')))

	/**
	 * Check if a given MIME type string is supported by the MIME filter values
	 *
	 * @param mime MIME type string to check
	 * @return True if mime is allowed by MIME filter values, false otherwise
	 */
	const isSupportedMimeType = (mime: string): boolean => {
		const mimeTypeArray = mime.split('/')
		return splittedTypes.value.some(([type, subtype]) => (
			// check mime type matches or is wildcard
			(mimeTypeArray[0] === type || type === '*')
			// check mime subtype matches or is wildcard
			&& (mimeTypeArray[1] === subtype || subtype === '*')
		))
	}

	return {
		isSupportedMimeType,
	}
}
