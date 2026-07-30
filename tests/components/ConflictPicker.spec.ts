/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ConflictInput, ConflictResolutionResult } from '../../lib/conflict-picker.ts'

import { File as NcFile } from '@nextcloud/files'
import { cleanup, findByText, fireEvent, getAllByRole, getByRole, queryAllByRole, render } from '@testing-library/vue'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import ConflictPicker from '../../lib/components/ConflictPicker/ConflictPicker.vue'

afterEach(cleanup)

describe('Single file conflict', () => {
	const oldImage = new NcFile({
		id: 1,
		root: '/files/user',
		source: 'http://cloud.domain.com/remote.php/dav/files/user/image.jpg',
		mime: 'image/jpeg',
		size: 1000,
		owner: 'user',
		mtime: new Date('2021-01-01T00:00:00.000Z'),
	})

	test('Renders without checkboxes and with keep both / replace buttons', async () => {
		const image = new File([], 'image.jpg')
		render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [oldImage],
				incoming: [image],
			},
		})

		const dialog = getByRole(document.body, 'dialog', { name: 'Select file to keep' })
		expect(dialog).toBeInstanceOf(HTMLElement)

		// No checkboxes for a single file
		expect(queryAllByRole(dialog, 'checkbox')).toHaveLength(0)

		expect(getByRole(dialog, 'button', { name: 'Cancel' })).toBeInstanceOf(HTMLElement)
		expect(getByRole(dialog, 'button', { name: 'Keep both' })).toBeInstanceOf(HTMLElement)
		expect(getByRole(dialog, 'button', { name: 'Replace' })).toBeInstanceOf(HTMLElement)
	})

	test('Shows only the folder name, the root is called "All files"', async () => {
		const image = new File([], 'image.jpg')
		const props = {
			container: getContainer(),
			existing: [oldImage],
			incoming: [image],
		}

		const component = render(ConflictPicker, { props: { ...props, dirname: '/Photos/Sub folder' } })
		const dialog = getByRole(document.body, 'dialog')
		expect(dialog.querySelector('strong')!.textContent).toBe('Sub folder')

		await component.rerender({ ...props, dirname: '/' })
		expect(dialog.querySelector('strong')!.textContent).toBe('All files')
	})

	test('Replace keeps only the new file', async () => {
		const image = new File([], 'image.jpg')
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [oldImage],
				incoming: [image],
			},
		})

		const dialog = getByRole(document.body, 'dialog')
		await fireEvent(getByRole(dialog, 'button', { name: 'Replace' }), new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.selected).toEqual([image])
		expect(result.renamed).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
	})

	test('Keep both renames the new file', async () => {
		const image = new File([], 'image.jpg')
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [oldImage],
				incoming: [image],
			},
		})

		const dialog = getByRole(document.body, 'dialog')
		await fireEvent(getByRole(dialog, 'button', { name: 'Keep both' }), new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.renamed).toEqual([image])
		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
	})
})

describe('ConflictPicker resolving', () => {
	let images: File[] = []
	const old1 = new NcFile({
		id: 1,
		root: '/files/user',
		source: 'http://cloud.domain.com/remote.php/dav/files/user/image1.jpg',
		mime: 'image/jpeg',
		size: 1000,
		owner: 'user',
		mtime: new Date('2021-01-01T00:00:00.000Z'),
	})
	const old2 = new NcFile({
		id: 2,
		root: '/files/user',
		source: 'http://cloud.domain.com/remote.php/dav/files/user/image2.jpg',
		mime: 'image/jpeg',
		size: 1000,
		owner: 'user',
		mtime: new Date('2021-01-01T00:00:00.000Z'),
	})

	beforeAll(async () => {
		const content = await readFile(join(import.meta.dirname, '../fixtures/test.jpg'))
		images = [
			new File([new Uint8Array(content)], 'image1.jpg', { type: 'image/jpeg' }),
			new File([new Uint8Array(content)], 'image2.jpg', { type: 'image/jpeg' }),
		]
	})

	test('Show override hint', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')
		expect(dialog).toBeInstanceOf(HTMLElement)

		await expect(findByText(dialog, /folder is selected, any conflicting files within it/)).resolves.not.toThrow()

		await component.rerender({
			container: getContainer(),
			dirname: 'Pictures',
			existing: [old1, old2],
			incoming: [...images],
			isOverwriting: true,
		})
		await expect(findByText(dialog, /folder is selected, any files within it/)).resolves.not.toThrow()

		await component.rerender({
			container: getContainer(),
			dirname: 'Pictures',
			existing: [old1, old2],
			incoming: [...images],
			recursiveUpload: true,
		})
		await expect(findByText(dialog, /folder is selected, the content is written into the existing folder/)).resolves.not.toThrow()
	})

	test('New files are preselected so the user can continue right away', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const selectAllNew: HTMLInputElement = getByRole(dialog, 'checkbox', { name: 'New files' })
		expect(selectAllNew.checked).toBe(true)

		const individualCheckboxes: HTMLInputElement[] = getAllByRole(dialog, 'checkbox', { name: /New version/ })
		expect(individualCheckboxes).toHaveLength(2)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(true)
		}

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.renamed).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
		expect(result.selected).toEqual([...images])
	})

	test('Pick all existing files', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const selectAllNew: HTMLInputElement = getByRole(dialog, 'checkbox', { name: 'New files' })
		const selectAllExisting: HTMLInputElement = getByRole(dialog, 'checkbox', { name: 'Existing files' })

		// Deselect the (preselected) new files and select the existing ones instead
		await fireEvent(selectAllNew, new MouseEvent('click', { bubbles: true }))
		await fireEvent(selectAllExisting, new MouseEvent('click', { bubbles: true }))

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.renamed).toHaveLength(0)
		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toEqual([...images])
	})

	test('Pick all and rename', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		// New files are preselected, additionally select the existing ones
		const selectAllExisting: HTMLInputElement = getByRole(dialog, 'checkbox', { name: 'Existing files' })
		await fireEvent(selectAllExisting, new MouseEvent('click', { bubbles: true }))

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
		expect(result.renamed).toEqual([...images])
	})

	test('Pick one existing and one incoming', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const group1 = getByRole(dialog, 'group', { name: 'image1.jpg' })
		const existing1: HTMLInputElement = getByRole(group1, 'checkbox', { name: /Existing version/ })
		const incoming1: HTMLInputElement = getByRole(group1, 'checkbox', { name: /New version/ })

		// For image1 keep the existing file instead of the (preselected) new one
		await fireEvent(incoming1, new MouseEvent('click', { bubbles: true }))
		await fireEvent(existing1, new MouseEvent('click', { bubbles: true }))
		// image2 keeps its preselected new file

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<File>]
		expect(result.renamed).toHaveLength(0)
		expect(result.skipped).toHaveLength(1)
		expect(result.skipped[0]!.name).toBe('image1.jpg')
		expect(result.selected).toHaveLength(1)
		expect(result.selected[0]!.name).toBe('image2.jpg')
	})

	test('Skip all conflicts', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const submit = getByRole(dialog, 'button', { name: 'Skip 2 files' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput>]
		expect(result.renamed).toHaveLength(0)
		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toHaveLength(2)
		expect(result.skipped).toEqual([...images])
	})

	test('cancel the conflict resolution', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const submit = getByRole(dialog, 'button', { name: 'Cancel' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput> | null]
		expect(result).toBeNull()
	})

	test('Close dialog cancels the conflict resolution', async () => {
		const component = render(ConflictPicker, {
			props: {
				container: getContainer(),
				dirname: 'Pictures',
				existing: [old1, old2],
				incoming: [...images],
			},
		})

		const dialog = getByRole(document.body, 'dialog')

		const submit = getByRole(dialog, 'button', { name: 'Close' })
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const [result] = component.emitted('close')[0]! as [ConflictResolutionResult<ConflictInput> | null]
		expect(result).toBeNull()
	})
})

function getContainer(): string {
	if (document.getElementById('test-container') === null) {
		const container = document.createElement('div')
		container.id = 'test-container'
		document.body.appendChild(container)
	} else {
		document.getElementById('test-container')!.innerHTML = ''
	}
	return '#test-container'
}
