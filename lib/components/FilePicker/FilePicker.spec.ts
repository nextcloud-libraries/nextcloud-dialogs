/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { INode } from '@nextcloud/files'

import { Folder } from '@nextcloud/files'
import { shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, shallowRef } from 'vue'
import FilePicker from './FilePicker.vue'

const axios = vi.hoisted(() => ({
	get: vi.fn(() => new Promise(() => {})),
}))
vi.mock('@nextcloud/axios', () => ({ default: axios }))

// Shared state injected into the mocked `useDAVFiles` composable so we can
// control the current folder without hitting WebDAV.
const dav = vi.hoisted(() => ({
	files: undefined as never,
	folder: undefined as never,
	isLoading: undefined as never,
}))
vi.mock('../../composables/dav.ts', () => ({
	useDAVFiles: () => ({
		files: dav.files,
		folder: dav.folder,
		isLoading: dav.isLoading,
		loadFiles: vi.fn(),
		createDirectory: vi.fn(),
	}),
}))

const currentFolder = new Folder({
	owner: null,
	source: 'http://example.com/dav/folder',
	root: '/',
})

describe('FilePicker', () => {
	beforeEach(() => {
		dav.files = shallowRef([]) as never
		dav.folder = shallowRef(currentFolder) as never
		dav.isLoading = ref(false) as never
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	/**
	 * Mount the FilePicker with a `buttons` factory that captures the nodes
	 * that would be passed to the button callback.
	 *
	 * @param props Additional props for the FilePicker
	 */
	function mountWithButtonSpy(props: Record<string, unknown> = {}) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const buttons = vi.fn((_nodes: INode[]) => [{
			label: 'Pick',
			callback: () => {},
		}])

		shallowMount(FilePicker, {
			props: {
				name: 'Test picker',
				buttons,
				...props,
			},
		})

		// The last call reflects the current selection state
		return buttons.mock.calls.at(-1)![0]
	}

	it('picks the current folder if directory picking is allowed and nothing is selected', () => {
		const nodes = mountWithButtonSpy({ allowPickDirectory: true })
		expect(nodes).toEqual([currentFolder])
	})

	it('picks the current folder if `canPickFn` allows it', () => {
		const canPickFn = vi.fn(() => true)
		const nodes = mountWithButtonSpy({ allowPickDirectory: true, canPickFn })

		expect(canPickFn).toHaveBeenCalledWith(currentFolder)
		expect(nodes).toEqual([currentFolder])
	})

	it('does not pick the current folder if `canPickFn` rejects it', () => {
		const canPickFn = vi.fn(() => false)
		const nodes = mountWithButtonSpy({ allowPickDirectory: true, canPickFn })

		expect(canPickFn).toHaveBeenCalledWith(currentFolder)
		// The unpickable folder must not be passed as a selected node
		expect(nodes).toEqual([])
	})
})
