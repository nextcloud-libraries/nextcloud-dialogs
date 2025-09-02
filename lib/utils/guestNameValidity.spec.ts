/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from 'vitest'
import { getGuestNameValidity } from './guestNameValidity.ts'

vi.mock('@nextcloud/files', () => ({
	validateFilename: vi.fn(),
}))

describe('guestNameValidity', () => {
	it('rejects names that are too long', () => {
		const tooLong = 'This string is longer than 64 characters and therefore tooo long.'
		expect(tooLong.length).toBeGreaterThan(64)
		expect(getGuestNameValidity(tooLong)).toBe('Names may be at most 64 characters long.')
	})

	it('Accepts long strings in 16 bit chars.', () => {
		const shortEnough = '人名用漢字 (Jinmeiyō-Kanji) used in names: 丑丞乃之也亀...'
		expect(shortEnough.length).toBeLessThan(64)
		expect(getGuestNameValidity(shortEnough)).toBe('')
	})
})
