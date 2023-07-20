import { createLibConfig } from '@nextcloud/vite-config'
import { readdirSync, readFileSync } from 'fs'
import gettextParser from 'gettext-parser'
import { defineConfig } from 'vite'

const translations = readdirSync('./l10n')
	.filter(name => name !== 'messages.pot' && name.endsWith('.pot'))
	.map(file => {
		const path = './l10n/' + file
		const locale = file.slice(0, -'.pot'.length)

		const po = readFileSync(path)
		const json = gettextParser.po.parse(po)
		return {
			locale,
			json,
		}
	})

export default defineConfig((env) => {
	return createLibConfig({
		'index': 'lib/index.ts'
	}, {
		inlineCSS: false,
		config: {
			build: {
				// Fix for vite config, TODO: remove with next release
				cssCodeSplit: false,
			},
		},
		nodeExternalsOptions: {
			include: [/^@nextcloud\//],
		},
		libraryFormats: ['es', 'cjs'],
		replace: {
			__TRANSLATIONS__: JSON.stringify(translations),
		},
		DTSPluginOptions: {
			rollupTypes: env.mode === 'production',
		},
	})(env)
})
