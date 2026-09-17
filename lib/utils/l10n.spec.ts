/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { setLanguage } from '@nextcloud/l10n'
import { beforeEach, expect, test, vi } from 'vitest'

beforeEach(() => vi.resetModules())

test('translation compressing and decompressing is working', async () => {
	setLanguage('de')
	const { t } = await import('./l10n.ts')
	expect(t('Names must not be empty.')).toMatchInlineSnapshot('"Namen dürfen nicht leer sein."')
})

// if a language is not available, it should fall back to the base language (e.g. ja-JP -> ja)
test('properly falls back to base language', async () => {
	setLanguage('ja')
	const { t } = await import('./l10n.ts')
	expect(t('Names must not be empty.')).toMatchInlineSnapshot('"名前は空にできません。"')
})
