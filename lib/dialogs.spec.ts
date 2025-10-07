/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { cleanup, findByRole, fireEvent, getByLabelText, getByRole } from '@testing-library/vue'
import { afterEach, expect, test } from 'vitest'
import { showConfirmation } from './dialogs.ts'

afterEach(cleanup)

test('Show confirmation dialog', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	expect(dialog).toBeInstanceOf(HTMLElement)

	expect(getByLabelText(document.documentElement, 'Dialog name')).toBe(dialog)
	expect(dialog.textContent).toContain('Dialog text')

	const close = getByRole(dialog, 'button', { name: 'Close' })
	expect(close).toBeInstanceOf(HTMLElement)
	const confirm = getByRole(dialog, 'button', { name: 'Confirm' })
	expect(confirm).toBeInstanceOf(HTMLElement)
	await fireEvent(confirm, new MouseEvent('click', { bubbles: true }))
	expect(promise).resolves.toBe(true)
})

test('show confirmation dialog with reject', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
		labelConfirm: 'My confirm',
		labelReject: 'My reject',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	const confirm = getByRole(dialog, 'button', { name: 'My confirm' })
	const reject = getByRole(dialog, 'button', { name: 'My reject' })
	expect(confirm).toBeInstanceOf(HTMLElement)
	expect(reject).toBeInstanceOf(HTMLElement)
	await fireEvent(reject, new MouseEvent('click', { bubbles: true }))
	expect(promise).resolves.toBe(false)
})

test('show confirmation dialog and close', async () => {
	const promise = showConfirmation({
		name: 'Dialog name',
		text: 'Dialog text',
	})

	const dialog = await findByRole(document.documentElement, 'dialog')
	const close = getByRole(dialog, 'button', { name: 'Close' })
	expect(close).toBeInstanceOf(HTMLElement)
	await fireEvent(close, new MouseEvent('click', { bubbles: true }))
	expect(promise).rejects.toThrowError('Dialog closed')
})
