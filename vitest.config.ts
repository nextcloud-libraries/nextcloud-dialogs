/**
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */
import type { ConfigEnv } from 'vite'
import { defineConfig, type ViteUserConfig } from 'vitest/config'
import config from './vite.config'

export default defineConfig(async (env: ConfigEnv): Promise<ViteUserConfig> => {
	const cfg = await config(env)

	return {
		...cfg,

		// filter node-externals which will interfere with vitest
		plugins: cfg.plugins!.filter((plugin) => plugin && (!('name' in plugin) || plugin.name !== 'node-externals')),

		// vitest configuration
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
	}
})
