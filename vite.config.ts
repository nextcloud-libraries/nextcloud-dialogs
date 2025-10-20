/**
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */
import { createLibConfig } from '@nextcloud/vite-config'
import { readdirSync, readFileSync } from 'fs'
import { po as poParser } from 'gettext-parser'

const translations = readdirSync('./l10n')
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

export default createLibConfig({
	index: 'lib/index.ts',
}, {
	config: {
		build: {
			cssCodeSplit: false,
		},
	},
	libraryFormats: ['es'],
	// Packages that should be externalized or bundled
	nodeExternalsOptions: {
		// for subpath imports like '@nextcloud/l10n/gettext'
		include: [/^@nextcloud\//],
		exclude: [
			// we should not rely on external vue SFC dependencies thus bundle all .vue files
			/^vue-material-design-icons\//,
			/\.vue(\?|$)/,
			// and bundle raw data, e.g., raw SVGs
			/\?raw$/,
		],
	},
	// Inject our translations
	replace: {
		__TRANSLATIONS__: JSON.stringify(translations),
	},
})
