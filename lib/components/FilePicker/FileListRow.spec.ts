/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Wrapper } from '@vue/test-utils'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { File, Folder, Permission } from '@nextcloud/files'
import { shallowMount } from '@vue/test-utils'

import FileListRow from './FileListRow.vue'
import { nextTick } from 'vue'

type SubmitAction = (wrapper: Wrapper<any>) => Promise<void>
type ElementEvent = { 'update:selected': boolean | undefined, 'enter-directory': Folder | undefined }
type FileListRowProps = InstanceType<typeof FileListRow>['$props']

const node = new File({
	owner: 'alice',
	mtime: new Date(),
	mime: 'text/plain',
	source: 'https://example.com/remote.php/dav/alice/a.txt',
	root: '/',
	attributes: { displayname: 'test' },
})

const folder = new Folder({
	owner: 'alice',
	mtime: new Date(),
	mime: 'httpd/unix-directory',
	source: 'https://example.com/remote.php/dav/alice/b',
	root: '/',
	permissions: Permission.ALL,
	attributes: { displayname: 'test folder' },
})

const folderNonReadable = new Folder({
	owner: 'alice',
	mtime: new Date(),
	mime: 'httpd/unix-directory',
	source: 'https://example.com/remote.php/dav/alice/b',
	root: '/',
	permissions: Permission.ALL & ~Permission.READ,
	attributes: { displayname: 'test folder' },
})

const defaultOptions = {
	selected: false,
	cropImagePreviews: true,
	canPick: true,
	showCheckbox: true,
	allowPickDirectory: true,
}

const noEmits = {
	'update:selected': undefined,
	'enter-directory': undefined,
}

const selectNode = {
	'update:selected': true,
	'enter-directory': undefined,
}

const navigateToFolder = {
	'update:selected': undefined,
	'enter-directory': folder,
}

describe('FilePicker: FileListRow', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('is shallowMountable', () => {
		const consoleWarn = vi.spyOn(console, 'warn')
		const consoleError = vi.spyOn(console, 'error')

		const wrapper = shallowMount(FileListRow as any, {
			propsData: {
				allowPickDirectory: true,
				selected: false,
				showCheckbox: true,
				canPick: true,
				node,
				cropImagePreviews: true,
			},
		})

		// No console errors
		expect(consoleWarn).not.toBeCalled()
		expect(consoleError).not.toBeCalled()
		// shallowMounted
		expect(wrapper.exists()).toBe(true)
		expect(wrapper.element.tagName.toLowerCase()).toBe('tr')
		expect(wrapper.find('[data-testid="file-list-row"]').text()).not.toBe('')
	})

	it('shows checkbox based on `showCheckbox` property', async () => {
		const wrapper = shallowMount(FileListRow as any, {
			propsData: {
				allowPickDirectory: true,
				selected: false,
				showCheckbox: true,
				canPick: true,
				node,
				cropImagePreviews: true,
			},
		})

		expect(wrapper.find('[data-testid="row-checkbox"]').exists()).toBe(true)
		await wrapper.setProps({ showCheckbox: false })
		expect(wrapper.find('[data-testid="row-checkbox"]').exists()).toBe(false)
	})

	describe('when node is a file', () => {
		const fileOptions = {
			...defaultOptions,
			node,
		}

		testSubmitNode('Click checkbox triggers select', { ...fileOptions }, selectNode, clickCheckboxAction)
		testSubmitNode('Click element triggers select', { ...fileOptions }, selectNode, clickElementAction)
		testSubmitNode('Click element without checkbox triggers select', { ...fileOptions, showCheckbox: false }, selectNode, clickElementAction)
		testSubmitNode('Enter triggers select', { ...fileOptions, showCheckbox: false }, selectNode, pressEnterAction)

		describe('canPick: false', () => {
			const options = {
				...fileOptions,
				canPick: false,
			}

			testSubmitNode('Click checkbox does not triggers select', options, noEmits, clickCheckboxAction)
			testSubmitNode('Click element does not triggers select', options, noEmits, clickElementAction)
			testSubmitNode('Click element without checkbox does not triggers select', { ...options, showCheckbox: false }, noEmits, clickElementAction)
			testSubmitNode('Enter does not triggers select', { ...options, showCheckbox: false }, noEmits, pressEnterAction)
		})
	})

	describe('when node is a folder', () => {
		const folderOptions = {
			...defaultOptions,
			node: folder,
		}

		testSubmitNode('Click checkbox triggers select', folderOptions, selectNode, clickCheckboxAction)
		testSubmitNode('Click element navigates to it', folderOptions, navigateToFolder, clickElementAction)
		testSubmitNode('Click element without checkbox navigates to it', { ...folderOptions, showCheckbox: false }, navigateToFolder, clickElementAction)
		testSubmitNode('Enter navigates to it', { ...folderOptions, showCheckbox: false }, navigateToFolder, pressEnterAction)

		describe('canPick: false', () => {
			const options = {
				...folderOptions,
				canPick: false,
			}

			testSubmitNode('Click checkbox does not triggers select', options, noEmits, clickCheckboxAction)
			testSubmitNode('Click element navigates to it', options, navigateToFolder, clickElementAction)
			testSubmitNode('Click element without checkbox navigates to it', { ...options, showCheckbox: false }, navigateToFolder, clickElementAction)
			testSubmitNode('Enter navigates to it', { ...options, showCheckbox: false }, navigateToFolder, pressEnterAction)
		})

		describe('without READ permissions', () => {
			const options = {
				...folderOptions,
				node: folderNonReadable,
			}

			testSubmitNode('Click checkbox triggers select', options, selectNode, clickCheckboxAction)
			testSubmitNode('Click element does not navigates to it', options, noEmits, clickElementAction)
			testSubmitNode('Click element without checkbox does not navigates to it', { ...options, showCheckbox: false }, noEmits, clickElementAction)
			testSubmitNode('Enter does not navigates to it', { ...options, showCheckbox: false }, noEmits, pressEnterAction)
		})

		describe('allowPickDirectory: false', () => {
			const options = {
				...folderOptions,
				node: folderNonReadable,
				allowPickDirectory: false,
			}

			testSubmitNode('Click checkbox does not triggers select', options, noEmits, clickCheckboxAction)
		})
	})
})

/**
 * Helper function to test the emitted events when submitting a node (file or folder)
 *
 * @param name - the name of the test case
 * @param propsData - the props to pass to the FileListRow component
 * @param eventPayload - the expected emitted events and their payloads
 * @param actionCallback - the action to perform to submit the node
 */
function testSubmitNode(name: string, propsData: FileListRowProps, eventPayload: ElementEvent, actionCallback: SubmitAction) {
	it(name, async () => {
		const wrapper = shallowMount(FileListRow as any, {
			propsData,
			stubs: {
				NcCheckboxRadioSwitch: {
					template: '<label><input type="checkbox" @click="$emit(\'update:model-value\', true)" ></label>',
				},
			},
		})

		await actionCallback(wrapper)

		for (const [event, payload] of Object.entries(eventPayload)) {
			if (payload === undefined) {
				expect(wrapper.emitted(event)).toBeUndefined()
			} else {
				expect(wrapper.emitted(event)).toEqual([[payload]])
			}
		}
	})
}

/**
 * Click on the checkbox element
 *
 * @param wrapper - the wrapper of the FileListRow component
 */
async function clickCheckboxAction(wrapper: Wrapper<any>) {
	wrapper.find('input[type="checkbox"]').trigger('click')
}

/**
 * Click on the row element
 *
 * @param wrapper - the wrapper of the FileListRow component
 */
async function clickElementAction(wrapper: Wrapper<any>) {
	wrapper.find('[data-testid="row-name"]').trigger('click')
}

/**
 * Press Enter key on the row element
 *
 * @param wrapper - the wrapper of the FileListRow component
 */
async function pressEnterAction(wrapper: Wrapper<any>) {
	wrapper.element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
	await nextTick()
}
