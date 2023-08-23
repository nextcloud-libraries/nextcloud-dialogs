import { defineConfig } from 'vitest/config'
import config from './vite.config'

export default defineConfig(async (env) => {
	const viteConfig = (await config(env))
	delete viteConfig.define

	return {
		...viteConfig,
		test: {
			environment: 'happy-dom',
			coverage: {
				provider: 'istanbul',
				include: ['lib/**/*.ts', 'lib/*.ts'],
				exclude: ['lib/**/*.spec.ts'],
			},
			// Fix unresolvable .css extension for ssr
			server: {
				deps: {
					inline: [/@nextcloud\/vue/],
				},
			},
		},
	}
})
