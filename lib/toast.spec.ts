/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { showMessage, TOAST_DEFAULT_TIMEOUT, TOAST_PERMANENT_TIMEOUT, ToastType } from './toast.ts'

const getCapabilities = vi.hoisted(() => vi.fn())

vi.mock('@nextcloud/capabilities', () => ({
	getCapabilities,
}))

vi.mock('toastify-js', () => ({
	default: vi.fn((options: { duration?: number }) => ({
		options,
		showToast: vi.fn(),
		hideToast: vi.fn(),
	})),
}))

import Toastify from 'toastify-js'

beforeEach(() => {
	getCapabilities.mockReset()
	vi.mocked(Toastify).mockClear()
})

afterEach(() => {
	document.body.innerHTML = ''
})

test('uses default timeout when capabilities are missing', () => {
	getCapabilities.mockImplementation(() => {
		throw new Error('no capabilities')
	})

	showMessage('hello')

	expect(Toastify).toHaveBeenCalledWith(expect.objectContaining({
		duration: TOAST_DEFAULT_TIMEOUT,
	}))
})

test('uses toastTimeout from theming capabilities', () => {
	getCapabilities.mockReturnValue({
		theming: {
			toastTimeout: 15_000,
		},
	})

	showMessage('hello')

	expect(Toastify).toHaveBeenCalledWith(expect.objectContaining({
		duration: 15_000,
	}))
})

test('allows permanent timeout from capabilities', () => {
	getCapabilities.mockReturnValue({
		theming: {
			toastTimeout: TOAST_PERMANENT_TIMEOUT,
		},
	})

	showMessage('hello')

	expect(Toastify).toHaveBeenCalledWith(expect.objectContaining({
		duration: TOAST_PERMANENT_TIMEOUT,
	}))
})

test('falls back for invalid capability values', () => {
	getCapabilities.mockReturnValue({
		theming: {
			toastTimeout: 0,
		},
	})

	showMessage('hello')

	expect(Toastify).toHaveBeenCalledWith(expect.objectContaining({
		duration: TOAST_DEFAULT_TIMEOUT,
	}))
})

test('does not override loading toast duration', () => {
	getCapabilities.mockReturnValue({
		theming: {
			toastTimeout: 30_000,
		},
	})

	showMessage('loading', {
		type: ToastType.LOADING,
		timeout: TOAST_PERMANENT_TIMEOUT,
	})

	expect(Toastify).toHaveBeenCalledWith(expect.objectContaining({
		duration: TOAST_PERMANENT_TIMEOUT,
	}))
})
