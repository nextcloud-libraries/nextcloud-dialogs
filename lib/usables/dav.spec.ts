/**
 * @copyright Copyright (c) 2023 Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { defineComponent, ref, toRef } from 'vue'
import { useDAVFiles } from './dav'

const nextcloudFiles = vi.hoisted(() => ({
	davGetClient: vi.fn(),
	davRootPath: '/root/uid',
	davResultToNode: vi.fn(),
	davGetDefaultPropfind: vi.fn(),
	davGetRecentSearch: (time: number) => `recent ${time}`,
	getFavoriteNodes: vi.fn(),
}))
vi.mock('@nextcloud/files', () => nextcloudFiles)

const waitLoaded = (vue: ReturnType<typeof shallowMount>) => new Promise((resolve) => {
	const w = () => {
		if (vue.vm.isLoading) window.setTimeout(w, 50)
		else resolve(true)
	}
	w()
})

const TestComponent = defineComponent({
	props: ['currentView', 'currentPath'],
	setup(props) {
		const dav = useDAVFiles(toRef(props, 'currentView'), toRef(props, 'currentPath'))
		return {
			...dav,
		}
	},
	render: (h) => h('div'),
})

describe('dav usable', () => {
	afterEach(() => { vi.resetAllMocks() })

	it('Sets the inital state correctly', () => {
		const client = {
			getDirectoryContents: vi.fn(() => ({ data: [] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
				currentPath: '/',
			},
		})
		// Loading is set to true
		expect(vue.vm.isLoading).toBe(true)
		// Dav client for dav remote url is gathered
		expect(nextcloudFiles.davGetClient).toBeCalled()
		// files is an empty array
		expect(Array.isArray(vue.vm.files)).toBe(true)
		expect(vue.vm.files.length).toBe(0)
		// functions
		expect(typeof vue.vm.getFile === 'function').toBe(true)
		expect(typeof vue.vm.loadFiles === 'function').toBe(true)
	})

	it('loads initial file list', async () => {
		const client = {
			getDirectoryContents: vi.fn(() => ({ data: ['1', '2'] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)
		nextcloudFiles.davResultToNode.mockImplementation((v) => `node ${v}`)

		const vue = shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
				currentPath: '/',
			},
		})

		// wait until files are loaded
		await waitLoaded(vue)

		expect(vue.vm.files).toEqual(['node 1', 'node 2'])
	})

	it('reloads on path change', async () => {
		const client = {
			getDirectoryContents: vi.fn((str) => ({ data: [] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
				currentPath: '/',
			},
		})

		// wait until files are loaded
		await waitLoaded(vue)

		expect(client.getDirectoryContents).toBeCalledTimes(1)
		expect(client.getDirectoryContents.mock.calls[0][0]).toBe(`${nextcloudFiles.davRootPath}/`)

		vue.setProps({ currentPath: '/other' })
		await waitLoaded(vue)

		expect(client.getDirectoryContents).toBeCalledTimes(2)
		expect(client.getDirectoryContents.mock.calls[1][0]).toBe(`${nextcloudFiles.davRootPath}/other`)
	})

	it('reloads on view change', async () => {
		const client = {
			getDirectoryContents: vi.fn((str) => ({ data: [] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			propsData: {
				currentView: 'files',
				currentPath: '/',
			},
		})

		// wait until files are loaded
		await waitLoaded(vue)

		expect(client.getDirectoryContents).toBeCalledTimes(1)
		expect(client.getDirectoryContents.mock.calls[0][0]).toBe(`${nextcloudFiles.davRootPath}/`)

		vue.setProps({ currentView: 'recent' })
		await waitLoaded(vue)

		expect(client.getDirectoryContents).toBeCalledTimes(2)
	})

	it('getFile works', async () => {
		const client = {
			stat: vi.fn((v) => ({ data: { path: v } })),
			getDirectoryContents: vi.fn(() => ({ data: [] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)
		nextcloudFiles.davResultToNode.mockImplementationOnce((v) => v)

		const { getFile } = useDAVFiles(ref('files'), ref('/'))

		const node = await getFile('/some/path')
		expect(node).toEqual({ path: `${nextcloudFiles.davRootPath}/some/path` })
		expect(client.stat).toBeCalledWith(`${nextcloudFiles.davRootPath}/some/path`, { details: true })
		expect(nextcloudFiles.davResultToNode).toBeCalledWith({ path: `${nextcloudFiles.davRootPath}/some/path` })
	})

	it('loadFiles work', async () => {
		const client = {
			stat: vi.fn((v) => ({ data: { path: v } })),
			getDirectoryContents: vi.fn((p, o) => ({ data: [] })),
		}
		nextcloudFiles.davGetClient.mockImplementationOnce(() => client)
		nextcloudFiles.davResultToNode.mockImplementationOnce((v) => v)

		const view = ref<'files' | 'recent' | 'favorites'>('files')
		const path = ref('/')
		const { loadFiles, isLoading } = useDAVFiles(view, path)

		expect(isLoading.value).toBe(true)
		await loadFiles()
		expect(isLoading.value).toBe(false)
		expect(client.getDirectoryContents).toBeCalledWith(`${nextcloudFiles.davRootPath}/`, { details: true })

		view.value = 'recent'
		await loadFiles()
		expect(isLoading.value).toBe(false)
		expect(client.getDirectoryContents).toBeCalledWith(`${nextcloudFiles.davRootPath}/`, { details: true })
		expect(client.getDirectoryContents.mock.calls.at(-1)?.[1]?.data).toMatch('recent')

		view.value = 'favorites'
		await loadFiles()
		expect(isLoading.value).toBe(false)
		expect(nextcloudFiles.getFavoriteNodes).toBeCalled()
	})
})
