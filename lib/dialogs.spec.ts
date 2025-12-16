/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { findByRole, fireEvent, getByLabelText, getByRole } from '@testing-library/vue'
import { expect, test } from 'vitest'
import { showConfirmation } from './dialogs.ts'

async function waitForTransition() {
	await new Promise((r) => window.setTimeout(r, 250))
}

test('Show confirmation dialog', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	await waitForTransition()

	expect(dialog).toBeInstanceOf(HTMLElement)

	expect(getByLabelText(document.documentElement, 'Dialog name')).toBe(dialog)
	expect(dialog.textContent).toContain('Dialog text')

	const close = getByRole(dialog, 'button', { name: 'Close' })
	expect(close).toBeInstanceOf(HTMLElement)
	const confirm = getByRole(dialog, 'button', { name: 'Confirm' })
	expect(confirm).toBeInstanceOf(HTMLElement)
	await fireEvent(confirm, new MouseEvent('click', { bubbles: true }))
	await expect(promise).resolves.toBe(true)
})

test('show confirmation dialog with reject', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
		labelConfirm: 'My confirm',
		labelReject: 'My reject',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	await waitForTransition()

	const confirm = await findByRole(dialog, 'button', { name: 'My confirm' })
	const reject = await findByRole(dialog, 'button', { name: 'My reject' })
	expect(confirm).toBeInstanceOf(HTMLElement)
	expect(reject).toBeInstanceOf(HTMLElement)
	await fireEvent(reject, new MouseEvent('click', { bubbles: true }))
	await expect(promise).resolves.toBe(false)
})

test('show confirmation dialog and close', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	await waitForTransition()

	const close = await findByRole(dialog, 'button', { name: 'Close' })
	await fireEvent(close, new MouseEvent('click', { bubbles: true }))
	await expect(promise).rejects.toThrowError('Dialog closed')
})
