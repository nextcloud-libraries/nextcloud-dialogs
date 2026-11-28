/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { cleanup, fireEvent, queryByRole, render } from '@testing-library/vue'
import { afterEach, describe, expect, test, vi } from 'vitest'
import FilePickerBreadcrumbs from './FilePickerBreadcrumbs.vue'

// `validateFilename` reads the server capabilities; provide sane defaults for tests
vi.mock('@nextcloud/capabilities', () => ({
	getCapabilities: () => ({ files: {} }),
}))

afterEach(cleanup)

/**
 * Render the breadcrumbs and open the "New" popover so the folder form is visible.
 *
 * @returns The testing-library render result
 */
async function renderWithOpenPopover() {
	const result = render(FilePickerBreadcrumbs, {
		props: { path: '/', showMenu: true },
	})
	const trigger = queryByRole(result.baseElement as HTMLElement, 'button', { name: 'Create directory' })
	expect(trigger).not.toBeNull()
	await fireEvent.click(trigger!)
	await new Promise((resolve) => setTimeout(resolve, 100))
	return result
}

describe('FilePickerBreadcrumbs new folder', () => {
	test('shows a trailing arrow button on the folder name input', async () => {
		const { baseElement } = await renderWithOpenPopover()

		const input = baseElement.querySelector('input[placeholder="New folder name"]')
		expect(input).not.toBeNull()

		const trailingButton = baseElement.querySelector('button.input-field__trailing-button')
		expect(trailingButton).not.toBeNull()
		expect(trailingButton!.getAttribute('aria-label')).toBe('Create directory')
	})

	test('creates the folder when the trailing arrow button is clicked', async () => {
		const { baseElement, emitted } = await renderWithOpenPopover()

		const input = baseElement.querySelector('input[placeholder="New folder name"]') as HTMLInputElement
		await fireEvent.update(input, 'My folder')

		const trailingButton = baseElement.querySelector('button.input-field__trailing-button') as HTMLButtonElement
		await fireEvent.click(trailingButton)

		expect(emitted('createNode')).toEqual([['My folder']])
	})

	test('creates the folder when Enter is pressed in the input', async () => {
		const { baseElement, emitted } = await renderWithOpenPopover()

		const input = baseElement.querySelector('input[placeholder="New folder name"]') as HTMLInputElement
		await fireEvent.update(input, 'My folder')
		await fireEvent.submit(input.closest('form')!)

		expect(emitted('createNode')).toEqual([['My folder']])
	})

	test('does not create a folder when the name is invalid', async () => {
		const { baseElement, emitted } = await renderWithOpenPopover()

		const input = baseElement.querySelector('input[placeholder="New folder name"]') as HTMLInputElement
		await fireEvent.update(input, 'invalid/name')

		const trailingButton = baseElement.querySelector('button.input-field__trailing-button') as HTMLButtonElement
		await fireEvent.click(trailingButton)

		expect(emitted('createNode')).toBeUndefined()
	})
})
