/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from 'vitest'
import { useMimeFilter } from './mime'
import { ref } from 'vue'

describe('mime composable', () => {
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
