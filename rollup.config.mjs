import * as fs from 'fs'
import gettextParser from 'gettext-parser'

import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

import postcss from 'rollup-plugin-postcss'
import postcssurl from 'postcss-url';

import BabelLoaderExcludeNodeModulesExcept from 'babel-loader-exclude-node-modules-except'

import { DEFAULT_EXTENSIONS } from '@babel/core'
const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

const translations = fs
	.readdirSync('./l10n')	
	.filter(name => name !== 'messages.pot' && name.endsWith('.pot'))
	.map(file => {
		const path = './l10n/' + file
		const locale = file.slice(0, -'.pot'.length)


		const po = fs.readFileSync(path)	
		const json = gettextParser.po.parse(po)	
		return {
			locale,
			json,
		}
	})

export default [
	{
		input: 'lib/index.ts',
		output: [
			{
				file: 'dist/index.js',
				format: 'cjs',
				sourcemap: true
			},
			{
				file: 'dist/index.es.js',
				format: 'esm',
				sourcemap: true
			}
		],
		plugins: [
			resolve({ extensions }),
			typescript(),
			commonjs({ extensions }),
			replace({
				preventAssignment: true,
				delimiters: ['\\b', '\\b'],
				values: {
					__TRANSLATIONS__: JSON.stringify(translations)
				}
			}),
			babel({
				babelHelpers: 'bundled',
				extensions,
				exclude: BabelLoaderExcludeNodeModulesExcept(['toastify-js']),
			}),
		]
	},
	{
		input: 'styles/toast.scss',
		output: {
			file: 'dist/index.css'
		},			
		plugins: [
			postcss({
				extract: true,
				sourceMap: true,
				plugins: [
					postcssurl({
						url: 'inline',
						encodeType: 'base64',
					}),
				]
			})
		]
	},
]
