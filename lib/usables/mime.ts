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
 *
 */
import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

/**
 * Create a filter function for MIME types
 * The filter function supports MIME type filters with wildcards
 *
 * @param allowedMIMETypes Reference to allowed MIME types
 */
export const useMimeFilter = function(allowedMIMETypes: Ref<readonly string[]> | ComputedRef<readonly string[]>) {
	// Cache splitted MIME types
	const splittedTypes = computed(() => allowedMIMETypes.value.map((filter) => filter.split('/')))

	/**
	 * Check if a given MIME type string is supported by the MIME filter values
	 * @param mime MIME type string to check
	 * @return True if mime is allowed by MIME filter values, false otherwise
	 */
	const isSupportedMimeType = (mime: string): boolean => {
		const mimeTypeArray = mime.split('/')
		return splittedTypes.value.some(
			([type, subtype]) =>
				// check mime type matches or is wildcard
				(mimeTypeArray[0] === type || type === '*')
				// check mime subtype matches or is wildcard
				&& (mimeTypeArray[1] === subtype || subtype === '*'),
		)
	}

	return {
		isSupportedMimeType,
	}
}
