import fs from 'fs'
import gettextParser from 'gettext-parser'

import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

import { DEFAULT_EXTENSIONS } from '@babel/core'
const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

const packageJson = require("./package.json");

const translations = []

export default {
	input: 'lib/index.ts',
	output: [
		{
			file: packageJson.main,
			format: "cjs",
			sourcemap: true
		},
		{
			file: packageJson.module,
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [
		resolve({ extensions }),
		typescript(),
		commonjs({ extensions }),
		injectProcessEnv({
			TRANSLATIONS: translations
		}),
		babel({
			babelHelpers: 'bundled',
			extensions,
			exclude: /node_modules/,
		}),
	]
}
