/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ConflictInput, ConflictResolutionResult } from '../../lib/conflict-picker.ts'

import { File as NcFile } from '@nextcloud/files'
import { cleanup, fireEvent, getAllByRole, getByRole, render } from '@testing-library/vue'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import ConflictPicker from '../../lib/components/ConflictPicker/ConflictPicker.vue'

afterEach(cleanup)

test('Renders default ConflictPicker', async () => {
	const oldImage = new NcFile({
		id: 1,
		root: '/files/user',
		source: 'http://cloud.domain.com/remote.php/dav/files/user/image.jpg',
		mime: 'image/jpeg',
		size: 1000,
		owner: 'user',
		mtime: new Date('2021-01-01T00:00:00.000Z'),
	})

	const image = new File([], 'image.jpg')
	render(ConflictPicker, {
		props: {
			container: getContainer(),
			dirname: 'Pictures',
			existing: [oldImage],
			incoming: [image],
		},
	})

	const dialog = getByRole(document.body, 'dialog')
	expect(dialog).toBeInstanceOf(HTMLElement)
	expect(getByRole(document.body, 'dialog', { name: /1 file conflict in Pictures/ })).toBeInstanceOf(HTMLElement)

	expect(getByRole(dialog, 'form')).toBeInstanceOf(HTMLElement)
	expect(getAllByRole(dialog, 'checkbox')).toHaveLength(4)

	expect(getByRole(dialog, 'checkbox', { name: 'Select all new files' })).toBeInstanceOf(HTMLElement)
	expect(getByRole(dialog, 'checkbox', { name: 'Select all existing files' })).toBeInstanceOf(HTMLElement)
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

	test('Pick all incoming files', async () => {
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

		const checkbox: HTMLInputElement = getByRole(dialog, 'checkbox', { name: /Select all new files/ })
		expect(checkbox.checked).toBe(false)

		const individualCheckboxes: HTMLInputElement[] = getAllByRole(dialog, 'checkbox', { name: /New version/ })
		expect(individualCheckboxes).toHaveLength(2)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(false)
		}

		await fireEvent(checkbox, new MouseEvent('click', { bubbles: true }))
		expect(checkbox.checked).toBe(true)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(true)
		}

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

		expect(result.renamed).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
		expect(result.selected).toHaveLength(2)
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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const checkbox: HTMLInputElement = getByRole(dialog, 'checkbox', { name: /Select all existing files/ })
		expect(checkbox.checked).toBe(false)

		const individualCheckboxes: HTMLInputElement[] = getAllByRole(dialog, 'checkbox', { name: /Existing version/ })
		expect(individualCheckboxes).toHaveLength(2)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(false)
		}

		await fireEvent(checkbox, new MouseEvent('click', { bubbles: true }))
		expect(checkbox.checked).toBe(true)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(true)
		}

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

		expect(result.renamed).toHaveLength(0)
		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toHaveLength(2)
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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const checkbox1: HTMLInputElement = getByRole(dialog, 'checkbox', { name: /Select all existing files/ })
		const checkbox2: HTMLInputElement = getByRole(dialog, 'checkbox', { name: /Select all new files/ })
		const individualCheckboxes: HTMLInputElement[] = getAllByRole(dialog, 'checkbox', { name: /(Existing|New) version/ })
		expect(individualCheckboxes).toHaveLength(4)
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(false)
		}

		await fireEvent(checkbox1, new MouseEvent('click', { bubbles: true }))
		await fireEvent(checkbox2, new MouseEvent('click', { bubbles: true }))
		for (const box of individualCheckboxes) {
			expect(box.checked).toBe(true)
		}

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

		expect(result.selected).toHaveLength(0)
		expect(result.skipped).toHaveLength(0)
		expect(result.renamed).toHaveLength(2)
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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const group1 = getByRole(dialog, 'group', { name: 'image1.jpg' })
		const group2 = getByRole(dialog, 'group', { name: 'image2.jpg' })
		const existing: HTMLInputElement = getByRole(group1, 'checkbox', { name: /Existing version/ })
		const incoming: HTMLInputElement = getByRole(group2, 'checkbox', { name: /New version/ })
		expect(existing.checked).toBe(false)
		expect(incoming.checked).toBe(false)

		await fireEvent(existing, new MouseEvent('click', { bubbles: true }))
		await fireEvent(incoming, new MouseEvent('click', { bubbles: true }))
		expect(existing.checked).toBe(true)
		expect(incoming.checked).toBe(true)

		const submit = getByRole(dialog, 'button', { name: 'Continue' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<File>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const submit = getByRole(dialog, 'button', { name: 'Skip 2 files' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const submit = getByRole(dialog, 'button', { name: 'Cancel' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

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
		expect(dialog).toBeInstanceOf(HTMLElement)

		const submit = getByRole(dialog, 'button', { name: 'Close' })
		expect(submit).toBeInstanceOf(HTMLButtonElement)
		await fireEvent(submit, new MouseEvent('click', { bubbles: true }))

		const events: [ConflictResolutionResult<ConflictInput>][] = component.emitted('close')
		expect(events).toHaveLength(1)
		const [result] = events[0]!

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
