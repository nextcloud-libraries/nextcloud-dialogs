/*!
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */

import { createLibConfig } from '@nextcloud/vite-config'
import { defineConfig } from 'vitest/config'
import { translations } from './build/translations.ts'

export default createLibConfig({
	index: 'lib/index.ts',
}, {
	inlineCSS: true,
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
	DtsPluginOptions: false,
	config: defineConfig({
		test: {
			environment: 'happy-dom',
			coverage: {
				provider: 'v8',
				include: ['lib/**/*.ts', 'lib/*.ts'],
				exclude: ['lib/**/*.spec.ts'],
			},
			css: {
				modules: {
					classNameStrategy: 'non-scoped',
				},
			},
			setupFiles: 'tests/setup.ts',
			server: {
				deps: {
					inline: [
						/@nextcloud\/vue/, // Fix unresolvable .css extension for ssr
						/@nextcloud\/files/, // Fix CommonJS cancelable-promise not supporting named exports
					],
				},
			},
		},
	}),
})
