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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { File } from '@nextcloud/files'

import FileListRow from './FileListRow.vue'

// Mock OC.MimeType
window.OC = {
	MimeType: {
		getIconUrl: (mime: string) => `/icon/${mime}`,
	},
} as never

describe('FilePicker: FileListRow', () => {
	const node = new File({
		owner: null,
		mtime: new Date(),
		mime: 'text/plain',
		source: 'https://example.com/dav/a.txt',
		root: '/',
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('is mountable', () => {
		const consoleWarn = vi.spyOn(console, 'warn')
		const consoleError = vi.spyOn(console, 'error')

		const wrapper = mount(FileListRow, {
			propsData: {
				allowPickDirectory: false,
				selected: false,
				canPick: true,
				node,
			},
		})

		// No console errors
		expect(consoleWarn).not.toBeCalled()
		expect(consoleError).not.toBeCalled()
		// mounted
		expect(wrapper.isEmpty()).toBe(false)
		expect(wrapper.element.tagName.toLowerCase()).toBe('tr')
		expect(wrapper.element.classList.contains('file-picker__row')).toBe(true)
	})

	it('Click triggers select', async () => {
		const wrapper = mount(FileListRow, {
			propsData: {
				allowPickDirectory: false,
				selected: false,
				canPick: true,
				node,
			},
		})

		await wrapper.find('.row-checkbox *').trigger('click')

		// one event with payload `true` is expected
		expect(wrapper.emitted('update:selected')).toEqual([[true]])
	})

	it('Enter triggers select', async () => {
		const wrapper = mount(FileListRow, {
			propsData: {
				allowPickDirectory: false,
				selected: false,
				canPick: true,
				node,
			},
		})

		await wrapper.trigger('keydown', { key: 'Enter', bubbles: true })

		expect(wrapper.emitted('update:selected')).toEqual([[true]])
	})
})
