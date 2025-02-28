/**
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */
import { defineConfig, mergeConfig } from 'vitest/config'
import config from './vite.config'

const testConfig = defineConfig({
	test: {
		environment: 'happy-dom',
		coverage: {
			all: true,
			provider: 'v8',
			include: ['lib/**/*.ts', 'lib/*.ts'],
			exclude: ['lib/**/*.spec.ts'],
		},
		css: {
			modules: {
				classNameStrategy: 'non-scoped',
			},
		},
		setupFiles: 'test/setup.ts',
		server: {
			deps: {
				inline: [
					/@nextcloud\/vue/, // Fix unresolvable .css extension for ssr
					/@nextcloud\/files/, // Fix CommonJS cancelable-promise not supporting named exports
				],
			},
		},
	},
})

export default defineConfig(async (...args) => mergeConfig(await config(...args), testConfig))
