/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { emit } from '@nextcloud/event-bus'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'
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

/**
 * Wait for the 50 ms setTimeout used in announce() to fire.
 * We intentionally advance only 100 ms so the 7-second cleanup timers
 * (polite <li> removal, assertive text clear) do NOT fire, allowing us to
 * assert on textContent immediately after the announcement.
 */
async function waitForAnnouncement() {
	await vi.advanceTimersByTimeAsync(100)
}

beforeEach(() => {
	vi.useFakeTimers()
	// Clear the DOM and the window-global singleton so each test
	// gets a fresh ToastContainer instance (live regions + toast stack).
	document.body.innerHTML = ''
	delete (window as typeof window & { __nc_toast_container__?: unknown }).__nc_toast_container__
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

		// The polite live region is part of the singleton ToastContainer;
		// showing many toasts must not create duplicate regions.
		const regions = document.querySelectorAll('[aria-live="polite"]')
		const ourRegions = Array.from(regions).filter((el) => el.classList.contains('hidden-visually'))
		expect(ourRegions).toHaveLength(1)
	})

	test('polite live region has aria-atomic="false" (items announced individually)', async () => {
		showInfo('Hello')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]')
		expect(region?.getAttribute('aria-atomic')).toBe('false')
	})

	test('assertive live region has aria-atomic="true" (whole text re-read)', async () => {
		showError('Oops')
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="assertive"]')
		expect(region?.getAttribute('aria-atomic')).toBe('true')
	})

	test('live regions are visually hidden via CSS class', async () => {
		showInfo('Hello')
		await waitForAnnouncement()

		const polite = document.querySelector('[aria-live="polite"]')
		const assertive = document.querySelector('[aria-live="assertive"]')
		expect(polite?.classList.contains('hidden-visually')).toBe(true)
		expect(assertive?.classList.contains('hidden-visually')).toBe(true)
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
		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement | null
		expect(closeBtn).not.toBeNull()
	})

	test('no close button rendered when close=false', () => {
		showMessage('No close', { close: false })
		expect(document.querySelector('button[aria-label="Close"]')).toBeNull()
	})
})

// ---------------------------------------------------------------------------
// Loading spinner – aria-hidden
// ---------------------------------------------------------------------------

describe('showLoading spinner', () => {
	test('spinner element has aria-hidden="true"', () => {
		showLoading('Uploading…')
		const spinner = document.querySelector('span[aria-hidden="true"]') as HTMLElement | null
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

// ---------------------------------------------------------------------------
// Dismissal: hideToast handle, close button, onRemove, auto-dismiss timeout
// ---------------------------------------------------------------------------

describe('dismissal', () => {
	test('hideToast() removes the toast element and calls onRemove', () => {
		const onRemove = vi.fn()
		const handle = showMessage('Removable', { onRemove })
		expect(document.querySelector('[role="status"]')).not.toBeNull()

		handle.hideToast()

		expect(onRemove).toHaveBeenCalledTimes(1)
		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('clicking the close button removes the toast and calls onRemove', () => {
		const onRemove = vi.fn()
		showMessage('Closable', { onRemove })

		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement
		closeBtn.click()

		expect(onRemove).toHaveBeenCalledTimes(1)
		expect(document.querySelector('button[aria-label="Close"]')).toBeNull()
	})

	test('toast auto-dismisses once its timeout elapses', async () => {
		showMessage('Temporary', { timeout: 1000 })
		expect(document.querySelector('[role="status"]')).not.toBeNull()

		await vi.advanceTimersByTimeAsync(1000)

		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('permanent toast (loading) is not auto-dismissed', async () => {
		showLoading('Uploading…')

		await vi.advanceTimersByTimeAsync(100_000)

		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})
})

// ---------------------------------------------------------------------------
// showUndo behaviour
// ---------------------------------------------------------------------------

describe('showUndo', () => {
	test('throws when onUndo is not a function', () => {
		// @ts-expect-error intentionally passing an invalid callback
		expect(() => showUndo('Deleted', null)).toThrow('Please provide a valid onUndo method')
	})

	test('clicking the undo button calls onUndo and dismisses the toast', () => {
		const onUndo = vi.fn()
		showUndo('Item deleted', onUndo)

		const undoBtn = Array.from(document.querySelectorAll('button'))
			.find((btn) => btn.textContent?.trim() === 'Undo') as HTMLButtonElement
		expect(undoBtn).not.toBeUndefined()

		undoBtn.click()

		expect(onUndo).toHaveBeenCalledTimes(1)
		expect(document.querySelector('[role="alert"]')).toBeNull()
	})
})

// ---------------------------------------------------------------------------
// selector option: mount into a specific host instead of document.body
// ---------------------------------------------------------------------------

describe('selector option', () => {
	test('mounts the toast inside the element matched by the selector', () => {
		const host = document.createElement('div')
		host.id = 'custom-toast-host'
		document.body.appendChild(host)

		showMessage('Scoped', { selector: '#custom-toast-host' })

		expect(host.querySelector('[role="status"]')).not.toBeNull()
	})
})

// ---------------------------------------------------------------------------
// Navigation-aware positioning
// ---------------------------------------------------------------------------

describe('navigation-aware positioning', () => {
	test('toast container gets the nav-open modifier while the app navigation is open', async () => {
		showInfo('Positioned')
		const container = document.querySelector('[role="status"]')?.parentElement?.parentElement as HTMLElement
		expect(container.classList.contains('toastContainer_navOpen')).toBe(false)

		emit('navigation-toggled', { open: true })
		await nextTick()
		expect(container.classList.contains('toastContainer_navOpen')).toBe(true)

		emit('navigation-toggled', { open: false })
		await nextTick()
		expect(container.classList.contains('toastContainer_navOpen')).toBe(false)
	})
})
