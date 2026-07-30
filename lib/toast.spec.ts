/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
	getToastTimeout,
	setToastTimeout,
	showLoading,
	showMessage,
	showUndo,
	TOAST_DEFAULT_TIMEOUT,
	TOAST_PERMANENT_TIMEOUT,
	TOAST_UNDO_TIMEOUT,
} from './toast.ts'

const mocks = vi.hoisted(() => ({
	hideToast: vi.fn(),
	showToast: vi.fn(),
	toastify: vi.fn(),
}))

vi.mock('toastify-js', () => ({
	default: mocks.toastify,
}))

const GLOBAL_TOAST_TIMEOUT_KEY = '__nextcloud_dialogs_toast_timeout__'

beforeEach(() => {
	delete window[GLOBAL_TOAST_TIMEOUT_KEY]
	vi.clearAllMocks()
	mocks.toastify.mockReturnValue({
		hideToast: mocks.hideToast,
		showToast: mocks.showToast,
	})
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('toast timeout configuration', () => {
	test('uses the default timeout when no valid timeout is configured', () => {
		expect(getToastTimeout()).toBe(TOAST_DEFAULT_TIMEOUT)

		window[GLOBAL_TOAST_TIMEOUT_KEY] = 0
		expect(getToastTimeout()).toBe(TOAST_DEFAULT_TIMEOUT)
	})

	test('stores positive and permanent timeouts globally', () => {
		setToastTimeout(30_000)
		expect(window[GLOBAL_TOAST_TIMEOUT_KEY]).toBe(30_000)
		expect(getToastTimeout()).toBe(30_000)

		setToastTimeout(TOAST_PERMANENT_TIMEOUT)
		expect(getToastTimeout()).toBe(TOAST_PERMANENT_TIMEOUT)
	})

	test.each([0, -2, Number.NaN])('rejects invalid timeout %s', (timeout) => {
		expect(() => setToastTimeout(timeout))
			.toThrow('Toast timeout must be a positive number or TOAST_PERMANENT_TIMEOUT')
	})

	test('falls back safely when window is unavailable', () => {
		vi.stubGlobal('window', undefined)

		expect(getToastTimeout()).toBe(TOAST_DEFAULT_TIMEOUT)
		expect(() => setToastTimeout(30_000)).not.toThrow()
	})
})

describe('toast timeout behavior', () => {
	test('uses the configured timeout for ordinary toasts', () => {
		setToastTimeout(30_000)

		showMessage('Message', { timeout: 1_000 })

		expect(mocks.toastify).toHaveBeenCalledWith(expect.objectContaining({
			duration: 30_000,
		}))
		expect(mocks.showToast).toHaveBeenCalledOnce()
	})

	test('preserves explicitly permanent toasts', () => {
		setToastTimeout(30_000)

		showMessage('Message', { timeout: TOAST_PERMANENT_TIMEOUT })

		expect(mocks.toastify).toHaveBeenCalledWith(expect.objectContaining({
			duration: TOAST_PERMANENT_TIMEOUT,
		}))
	})

	test('preserves the loading timeout', () => {
		setToastTimeout(30_000)

		showLoading('Loading')

		expect(mocks.toastify).toHaveBeenCalledWith(expect.objectContaining({
			duration: TOAST_PERMANENT_TIMEOUT,
		}))
	})

	test('preserves the undo timeout', () => {
		setToastTimeout(30_000)

		showUndo('Deleted', vi.fn())

		expect(mocks.toastify).toHaveBeenCalledWith(expect.objectContaining({
			duration: TOAST_UNDO_TIMEOUT,
		}))
	})
})
