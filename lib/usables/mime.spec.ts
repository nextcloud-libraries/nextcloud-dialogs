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

import { describe, expect, it } from 'vitest'
import { useMimeFilter } from './mime'
import { ref } from 'vue'

describe('mime useable', () => {
	it('isSupportedMimeType returns true if supported', () => {
		const supported = ref(['text/plain'])
		const { isSupportedMimeType } = useMimeFilter(supported)

		expect(isSupportedMimeType('text/plain')).toBe(true)
	})

	it('isSupportedMimeType returns false if not supported', () => {
		const supported = ref(['text/plain'])
		const { isSupportedMimeType } = useMimeFilter(supported)

		expect(isSupportedMimeType('font/truetype')).toBe(false)
	})

	it('isSupportedMimeType is reactive', () => {
		const supported = ref(['text/plain'])
		const { isSupportedMimeType } = useMimeFilter(supported)

		expect(isSupportedMimeType('font/truetype')).toBe(false)
		supported.value.push('font/truetype')
		expect(isSupportedMimeType('font/truetype')).toBe(true)
	})

	it('isSupportedMimeType works with wildcards', () => {
		const supported = ref(['text/*'])
		const { isSupportedMimeType } = useMimeFilter(supported)

		expect(isSupportedMimeType('text/plain')).toBe(true)
		expect(isSupportedMimeType('font/truetype')).toBe(false)
	})
})
