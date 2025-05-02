/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { PropType } from 'vue'
import type { FileListViews } from './filesSettings.ts'

import { shallowMount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useFilesViews } from './filesSettings'

const axios = vi.hoisted(() => ({
	get: vi.fn(),
}))
vi.mock('@nextcloud/axios', () => ({ default: axios }))

const TestComponent = defineComponent({
	props: {
		currentView: {
			type: String as PropType<FileListViews>,
		},
	},
	setup(props) {
		const settings = useFilesViews(props.currentView)
		return {
			...settings,
		}
	},
	render: () => h('div'),
})

describe('files app views config composable', () => {
	beforeAll(() => { vi.useFakeTimers() })
	afterAll(() => { vi.useRealTimers() })
	afterEach(() => { vi.resetAllMocks() })

	it('Sets the inital state correctly', async () => {
		axios.get.mockImplementation(() => {
			return new Promise(() => {})
		})
		const vue = await shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
			},
		})
		expect(vue.vm.filesViewConfig).toEqual({ sortBy: 'basename', order: 'ascending' })
		expect(vue.vm.recentViewConfig).toEqual({ sortBy: 'basename', order: 'ascending' })
		expect(vue.vm.currentConfig).toEqual({ sortBy: 'basename', order: 'ascending' })
		expect(axios.get).toBeCalled()
	})

	it('is reactive when loading values', async () => {
		axios.get.mockImplementation(() => {
			return new Promise((resolve) => window.setTimeout(() => resolve({
				data: {
					data: {
						files: {
							sorting_mode: 'mtime',
							sorting_direction: 'desc',
						},
					},
				},
			}), 400))
		})
		const vue = await shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
			},
		})
		expect(vue.vm.filesViewConfig).toEqual({ sortBy: 'basename', order: 'ascending' })
		await vi.advanceTimersByTimeAsync(500)
		expect(vue.vm.filesViewConfig).toEqual({ sortBy: 'mtime', order: 'descending' })
	})
})
