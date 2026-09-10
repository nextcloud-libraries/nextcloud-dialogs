/**
 * SPDX-FileCopyrightText: 2026 Josh Duffy
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IFolder, INode } from '@nextcloud/files'

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useDAVFiles } from './dav.ts'

const mocks = vi.hoisted(() => ({ nodes: vi.fn(), recent: vi.fn(), favorites: vi.fn() }))
vi.mock('@nextcloud/files/dav', () => ({
	getClient: () => ({}),
	defaultRootPath: '/files/test-user',
	getFavoriteNodes: mocks.favorites,
}))
vi.mock('../utils/dav.ts', () => ({
	getNodes: mocks.nodes,
	getRecentNodes: mocks.recent,
	getFile: vi.fn(),
}))

function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (error: Error) => void
	const promise = new Promise<T>((onResolve, onReject) => {
		resolve = onResolve
		reject = onReject
	})
	return { promise, resolve, reject }
}

const folder = (path: string) => ({ path, type: 'folder', permissions: 31 }) as IFolder
const response = (path: string) => ({ folder: folder(path), contents: [folder(`${path}/child`)] as INode[] })
type Response = ReturnType<typeof response>
let wrapper: ReturnType<typeof mount> | undefined

function setup() {
	const path = ref('/Source')
	const view = ref<'files' | 'recent' | 'favorites'>('files')
	let state!: ReturnType<typeof useDAVFiles>
	wrapper = mount(defineComponent({
		setup() {
			state = useDAVFiles(view, path)
			return () => h('div')
		},
	}))
	return { path, view, state }
}

async function settle() {
	await Promise.resolve()
	await Promise.resolve()
	await nextTick()
}

beforeEach(() => vi.resetAllMocks())
afterEach(() => wrapper?.unmount())

describe('DAV listing ownership', () => {
	it('ignores an older successful response after the current destination completes', async () => {
		const old = deferred<Response>()
		const latest = deferred<Response>()
		mocks.nodes.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
		const { path, state } = setup()
		path.value = '/Destination'
		await nextTick()
		latest.resolve(response('/Destination'))
		await settle()
		old.resolve(response('/Source'))
		await settle()
		expect(state.folder.value?.path).toBe('/Destination')
		expect(state.files.value[0]?.path).toBe('/Destination/child')
	})

	it('does not let an old cancellation clear the current loading state', async () => {
		const old = deferred<Response>()
		const pending = deferred<Response>()
		const third = deferred<Response>()
		mocks.nodes.mockReturnValueOnce(old.promise).mockReturnValueOnce(pending.promise).mockReturnValueOnce(third.promise)
		const { path, state } = setup()
		path.value = '/Destination'
		await nextTick()
		const signal = mocks.nodes.mock.calls[1]![0].signal as AbortSignal
		old.reject(Object.assign(new Error('test cancellation'), { name: 'AbortError' }))
		await settle()
		expect(state.isLoading.value).toBe(true)
		path.value = '/Elsewhere'
		await nextTick()
		expect(signal.aborted).toBe(true)
		third.resolve(response('/Elsewhere'))
		pending.resolve(response('/Destination'))
		await settle()
		expect(state.folder.value?.path).toBe('/Elsewhere')
	})

	it('invalidates the previous destination while a replacement load fails', async () => {
		mocks.nodes.mockResolvedValueOnce(response('/Source'))
		const { state } = setup()
		await settle()
		const failed = deferred<Response>()
		mocks.nodes.mockReturnValueOnce(failed.promise)
		const completion = state.loadFiles()
		expect(state.folder.value).toBeNull()
		expect(state.files.value).toEqual([])
		const caught = completion.catch((error) => error)
		failed.reject(new Error('test HTTP 500'))
		expect((await caught).message).toBe('test HTTP 500')
		expect(state.folder.value).toBeNull()
		expect(state.files.value).toEqual([])
		expect(state.isLoading.value).toBe(false)
	})

	it('keeps the latest view when an older view finishes last', async () => {
		mocks.nodes.mockResolvedValueOnce(response('/Source'))
		const recent = deferred<INode[]>()
		const favorites = deferred<INode[]>()
		mocks.recent.mockReturnValueOnce(recent.promise)
		mocks.favorites.mockReturnValueOnce(favorites.promise)
		const { view, state } = setup()
		await settle()
		view.value = 'recent'
		await nextTick()
		view.value = 'favorites'
		await nextTick()
		favorites.resolve([folder('/Favorite')])
		await settle()
		recent.resolve([folder('/OldRecent')])
		await settle()
		expect(state.folder.value).toBeNull()
		expect(state.files.value[0]?.path).toBe('/Favorite')
	})
})
