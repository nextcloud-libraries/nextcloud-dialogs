import type { ConfigEnv } from 'vite'
import config from './vite.config'

export default async (env: ConfigEnv) => {
	const cfg = await config(env)
	// filter node-externals which will interfere with vitest
	cfg.plugins = cfg.plugins!.filter((plugin) => plugin && (!('name' in plugin) || plugin.name !== 'node-externals'))
	return cfg
}
