/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
	showError,
	showInfo,
	showLoading,
	showMessage,
	showSuccess,
	showUndo,
	showWarning,
	ToastAriaLive,
} from './toast.ts'

/** Wait for the 50 ms setTimeout used in announceToLiveRegion to fire. */
async function waitForAnnouncement() {
	await vi.runAllTimersAsync()
}

beforeEach(() => {
	vi.useFakeTimers()
	// Reset the module-level singleton live region references between tests so
	// each test gets a fresh DOM state.
	document.body.innerHTML = ''
})

afterEach(() => {
	vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Persistent live regions
// ---------------------------------------------------------------------------

describe('live regions', () => {
	test('creates a polite live region on first polite toast', async () => {
		showInfo('Hello')
		await waitForAnnouncement()

		const regions = document.querySelectorAll('[aria-live="polite"]')
		expect(regions.length).toBeGreaterThanOrEqual(1)
	})

	test('creates an assertive live region on first error toast', async () => {
		showError('Oops')
		await waitForAnnouncement()

		const regions = document.querySelectorAll('[aria-live="assertive"]')
		expect(regions.length).toBeGreaterThanOrEqual(1)
	})

	test('reuses the same live region across multiple toasts', async () => {
		showInfo('First')
		showInfo('Second')
		await waitForAnnouncement()

		const regions = document.querySelectorAll('[aria-live="polite"]')
		const ourRegions = Array.from(regions).filter((el) => (el as HTMLElement).style.cssText.includes('clip'))
		expect(ourRegions).toHaveLength(1)
	})

	test('live region has aria-atomic="true"', async () => {
		showInfo('Hello')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"][aria-atomic="true"]')
		expect(region).not.toBeNull()
	})

	test('live region is visually hidden', async () => {
		showInfo('Hello')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement | null
		expect(region?.style.cssText).toContain('clip')
		expect(region?.style.position).toBe('absolute')
	})
})

// ---------------------------------------------------------------------------
// Announcement content
// ---------------------------------------------------------------------------

describe('announcement text', () => {
	test('showError prefixes message with "Error:"', async () => {
		showError('File not found')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="assertive"]') as HTMLElement
		expect(region.textContent).toBe('Error: File not found')
	})

	test('showWarning prefixes message with "Warning:"', async () => {
		showWarning('Low disk space')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Warning: Low disk space')
	})

	test('showInfo prefixes message with "Info:"', async () => {
		showInfo('Update available')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Info: Update available')
	})

	test('showSuccess prefixes message with "Success:"', async () => {
		showSuccess('File uploaded')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Success: File uploaded')
	})

	test('showMessage without type has no prefix', async () => {
		showMessage('Plain message')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Plain message')
	})

	test('same message announced twice is re-read (region cleared first)', async () => {
		showError('Duplicate')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="assertive"]') as HTMLElement
		expect(region.textContent).toBe('Error: Duplicate')

		// Second identical call: the clear happens synchronously, the re-set after timeout
		showError('Duplicate')
		// After clear but before timeout fires, content should be empty
		expect(region.textContent).toBe('')
		await waitForAnnouncement()
		expect(region.textContent).toBe('Error: Duplicate')
	})

	test('ariaLive OFF skips announcement entirely', async () => {
		showError('Silent error', { ariaLive: ToastAriaLive.OFF })
		await waitForAnnouncement()

		const assertiveRegion = document.querySelector('[aria-live="assertive"]')
		// Either no region was created, or it is empty
		expect(assertiveRegion?.textContent ?? '').toBe('')
	})
})

// ---------------------------------------------------------------------------
// role on toast element
// ---------------------------------------------------------------------------

describe('toast element role', () => {
	test('showError renders toast with role="alert"', async () => {
		showError('Boom')
		expect(document.querySelector('[role="alert"]')).not.toBeNull()
	})

	test('showUndo renders toast with role="alert"', async () => {
		showUndo('Item deleted', vi.fn())
		expect(document.querySelector('[role="alert"]')).not.toBeNull()
	})

	test('showInfo renders toast with role="status"', async () => {
		showInfo('FYI')
		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})

	test('showSuccess renders toast with role="status"', async () => {
		showSuccess('Done')
		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})

	test('showWarning renders toast with role="status"', async () => {
		showWarning('Careful')
		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})

	test('explicit assertive option produces role="alert"', async () => {
		showWarning('Urgent warning', { ariaLive: ToastAriaLive.ASSERTIVE })
		expect(document.querySelector('[role="alert"]')).not.toBeNull()
	})
})

// ---------------------------------------------------------------------------
// Close button accessible name
// ---------------------------------------------------------------------------

describe('close button', () => {
	test('close button has aria-label="Close"', () => {
		showInfo('Something happened')
		const closeBtn = document.querySelector('.nc-toast__close') as HTMLButtonElement | null
		expect(closeBtn).not.toBeNull()
		expect(closeBtn?.getAttribute('aria-label')).toBe('Close')
	})

	test('no close button rendered when close=false', () => {
		showMessage('No close', { close: false })
		expect(document.querySelector('.nc-toast__close')).toBeNull()
	})
})

// ---------------------------------------------------------------------------
// Loading spinner – aria-hidden
// ---------------------------------------------------------------------------

describe('showLoading spinner', () => {
	test('spinner element has aria-hidden="true"', () => {
		showLoading('Uploading…')
		const spinner = document.querySelector('.nc-toast__loader') as HTMLElement | null
		expect(spinner).not.toBeNull()
		expect(spinner?.getAttribute('aria-hidden')).toBe('true')
	})

	test('showLoading announces text without spinner noise', async () => {
		showLoading('Uploading…')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		// Should contain the text but NOT SVG markup
		expect(region.textContent).toBe('Uploading…')
	})
})

// ---------------------------------------------------------------------------
// ariaLive option forwarding
// ---------------------------------------------------------------------------

describe('ariaLive option', () => {
	test('custom ariaLive POLITE on error uses polite region', async () => {
		showError('Batch error', { ariaLive: ToastAriaLive.POLITE })
		await waitForAnnouncement()

		const politeRegion = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(politeRegion?.textContent).toContain('Batch error')
	})

	test('custom ariaLive ASSERTIVE on info uses assertive region', async () => {
		showInfo('Critical info', { ariaLive: ToastAriaLive.ASSERTIVE })
		await waitForAnnouncement()

		const assertiveRegion = document.querySelector('[aria-live="assertive"]') as HTMLElement
		expect(assertiveRegion?.textContent).toContain('Critical info')
	})
})
