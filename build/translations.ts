/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: MIT
 */

import { po as poParser } from 'gettext-parser'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const translations = readdirSync(resolve(import.meta.dirname, '../l10n'))
	.filter((name: string) => name !== 'messages.pot' && name.endsWith('.pot'))
	.map((file: string) => {
		const path = './l10n/' + file
		const language = file.slice(0, -'.pot'.length)

		const po = readFileSync(path)
		const json = poParser.parse(po)
		// compress the translations
		const translations = Object.entries(json.translations[''])
			.filter(([key]) => key)
			.map(([, value]) => value)

		return {
			language,
			translations,
		}
	})
	.filter(({ translations }) => translations.length > 1)
