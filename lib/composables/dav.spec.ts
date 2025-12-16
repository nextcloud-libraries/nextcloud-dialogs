/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ComponentPublicInstance, Ref } from 'vue'

import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, toRef } from 'vue'
import { useDAVFiles } from './dav.ts'

const nextcloudFiles = vi.hoisted(() => ({
	getClient: vi.fn(),
	defaultRootPath: '/root/uid',
	defaultRemoteURL: 'https://localhost/remote.php/dav',
	resultToNode: vi.fn(),
	getDefaultPropfind: vi.fn(),
	getRecentSearch: (time: number) => `recent ${time}`,
	getFavoriteNodes: vi.fn(),
}))
vi.mock('@nextcloud/files/dav', () => nextcloudFiles)

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function waitLoaded(vm: ComponentPublicInstance<{}, { isLoading: boolean }>) {
	return new Promise((resolve) => {
		const w = () => {
			if (vm.isLoading) {
				window.setTimeout(w, 50)
			} else {
				resolve(true)
			}
		}
		w()
	})
}

function waitRefLoaded(isLoading: Ref<boolean>) {
	return new Promise((resolve) => {
		const w = () => {
			if (isLoading.value) {
				window.setTimeout(w, 50)
			} else {
				resolve(true)
			}
		}
		w()
	})
}

const TestComponent = defineComponent({
	props: ['currentView', 'currentPath', 'isPublic'],
	setup(props) {
		const dav = useDAVFiles(toRef(props, 'currentView'), toRef(props, 'currentPath'))
		return {
			...dav,
		}
	},
	render: () => h('div'),
})

describe('dav composable', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('Sets the initial state correctly', () => {
		const client = {
			getDirectoryContents: vi.fn(() => ({ data: [] })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			props: {
				currentView: 'files',
				currentPath: '/',
				isPublic: false,
			},
		})
		// Loading is set to true
		expect(vue.vm.isLoading).toBe(true)
		// Dav client for dav remote url is gathered
		expect(nextcloudFiles.getClient).toBeCalled()
		// files is an empty array
		expect(Array.isArray(vue.vm.files)).toBe(true)
		expect(vue.vm.files.length).toBe(0)
		// functions
		expect(typeof vue.vm.loadFiles === 'function').toBe(true)
	})

	it('loads initial file list', async () => {
		const client = {
			getDirectoryContents: vi.fn(() => ({ data: ['1', '2'] })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)
		nextcloudFiles.resultToNode.mockImplementation((v) => `node ${v}`)

		const vue = shallowMount(TestComponent, {
			props: {
				currentView: 'files',
				currentPath: '/',
				isPublic: false,
			},
		})

		// wait until files are loaded
		await waitLoaded(vue.vm)

		expect(vue.vm.files).toEqual(['node 1', 'node 2'])
	})

	it('reloads on path change', async () => {
		const client = {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			getDirectoryContents: vi.fn((_path: string) => ({ data: [] })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			props: {
				currentView: 'files',
				currentPath: '/',
				isPublic: false,
			},
		})

		// wait until files are loaded
		await waitLoaded(vue.vm)

		expect(client.getDirectoryContents).toBeCalledTimes(1)
		expect(client.getDirectoryContents.mock.calls[0]![0]).toBe(`${nextcloudFiles.defaultRootPath}/`)

		vue.setProps({ currentPath: '/other' })
		await waitLoaded(vue.vm)

		expect(client.getDirectoryContents).toBeCalledTimes(2)
		expect(client.getDirectoryContents.mock.calls[1]![0]).toBe(`${nextcloudFiles.defaultRootPath}/other`)
	})

	it('reloads on view change', async () => {
		const client = {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			getDirectoryContents: vi.fn((_path: string) => ({ data: [] })),
			search: vi.fn(() => ({ data: { results: [], truncated: false } })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)

		const vue = shallowMount(TestComponent, {
			props: {
				currentView: 'files',
				currentPath: '/',
				isPublic: false,
			},
		})

		// wait until files are loaded
		await waitLoaded(vue.vm)

		expect(client.search).not.toBeCalled()
		expect(client.getDirectoryContents).toBeCalledTimes(1)
		expect(client.getDirectoryContents.mock.calls[0]![0]).toBe(`${nextcloudFiles.defaultRootPath}/`)

		vue.setProps({ currentView: 'recent' })
		await waitLoaded(vue.vm)

		// Uses search instead of getDirectoryContents
		expect(client.getDirectoryContents).toBeCalledTimes(1)
		expect(client.search).toBeCalledTimes(1)
	})

	it('createDirectory works', async () => {
		const client = {
			stat: vi.fn((v) => ({ data: { path: v } })),
			createDirectory: vi.fn(() => {}),
		}
		nextcloudFiles.getClient.mockImplementation(() => client)
		nextcloudFiles.resultToNode.mockImplementation((v) => v)

		const { createDirectory } = useDAVFiles(ref('files'), ref('/foo/'))

		const node = await createDirectory('my-name')
		expect(node).toEqual({ path: `${nextcloudFiles.defaultRootPath}/foo/my-name` })
		expect(client.stat).toBeCalledWith(`${nextcloudFiles.defaultRootPath}/foo/my-name`, { details: true })
		expect(client.createDirectory).toBeCalledWith(`${nextcloudFiles.defaultRootPath}/foo/my-name`)
	})

	it('loadFiles work', async () => {
		const client = {
			stat: vi.fn((v) => ({ data: { path: v } })),
			getDirectoryContents: vi.fn(() => ({ data: [] })),
			search: vi.fn(() => ({ data: { results: [], truncated: false } })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)
		nextcloudFiles.resultToNode.mockImplementationOnce((v) => v)
		nextcloudFiles.getFavoriteNodes.mockImplementationOnce(() => Promise.resolve([]))

		const view = ref<'files' | 'recent' | 'favorites'>('files')
		const path = ref('/')
		const { loadFiles, isLoading } = useDAVFiles(view, path)

		expect(isLoading.value).toBe(true)
		await loadFiles()
		expect(isLoading.value).toBe(false)
		expect(client.getDirectoryContents).toBeCalledWith(`${nextcloudFiles.defaultRootPath}/`, expect.objectContaining({ details: true }))

		view.value = 'recent'
		await waitRefLoaded(isLoading)
		expect(client.search).toBeCalledWith('/', expect.objectContaining({ details: true }))

		view.value = 'favorites'
		await waitRefLoaded(isLoading)
		expect(nextcloudFiles.getFavoriteNodes).toBeCalled()
	})

	it('request cancelation works', async () => {
		const client = {
			stat: vi.fn((v) => ({ data: { path: v } })),
			getDirectoryContents: vi.fn(() => ({ data: [] })),
			search: vi.fn(() => ({ data: { results: [], truncated: false } })),
		}
		nextcloudFiles.getClient.mockImplementationOnce(() => client)
		nextcloudFiles.resultToNode.mockImplementationOnce((v) => v)

		const view = ref<'files' | 'recent' | 'favorites'>('files')
		const path = ref('/')
		const { loadFiles, isLoading } = useDAVFiles(view, path)

		const abort = vi.spyOn(AbortController.prototype, 'abort')

		loadFiles()
		view.value = 'recent'
		await waitRefLoaded(isLoading)
		expect(abort).toBeCalledTimes(1)

		view.value = 'files'
		await nextTick()
		view.value = 'recent'
		await nextTick()
		view.value = 'favorites'
		await waitRefLoaded(isLoading)
		expect(abort).toBeCalledTimes(2)
	})
})
