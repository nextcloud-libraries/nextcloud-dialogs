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

/** The visual toast stack every toast is mounted into. */
function getStack(): HTMLElement {
	return document.querySelector('[data-nc-toast-stack]') as HTMLElement
}

/**
 * Let the ToastContainer pick up the current number of toasts.
 * They are mounted from the outside and counted with a MutationObserver, so
 * the region attributes only settle after its callback and the next render.
 */
async function flushStackObserver() {
	await vi.advanceTimersByTimeAsync(1)
	await nextTick()
}

/**
 * Move the pointer onto an element of the stack.
 *
 * @param target Element the pointer enters
 */
function pointerOver(target: Element): void {
	target.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
}

/**
 * Move the pointer off an element of the stack.
 *
 * @param target Element the pointer leaves
 * @param to     Element the pointer moves to, `document.body` (outside the stack) by default
 */
function pointerOut(target: Element, to: Node = document.body): void {
	target.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: to }))
}

/**
 * Press a key, by default on the document as the shortcut listener does.
 *
 * @param key    The `KeyboardEvent.key` value
 * @param target Element receiving the event
 */
function pressKey(key: string, target: EventTarget = document): void {
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
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
// Message display: HTML is stripped by default (XSS prevention)
// ---------------------------------------------------------------------------

describe('message display', () => {
	test('tags are stripped from a plain-text (non-isHTML) message', () => {
		showMessage('<b>Bold</b> and <a href="#">a link</a>')

		const toast = document.querySelector('[role="status"]') as HTMLElement
		expect(toast.textContent).toBe('Bold and a link')
		expect(toast.querySelector('b, a')).toBeNull()
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

	test('isHTML message announces plain text, tags are not read out', async () => {
		showMessage('<b>Bold</b> and <a href="#">a link</a>', { isHTML: true })
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Bold and a link')
	})

	test('isHTML message skips aria-hidden subtrees in the announcement', async () => {
		showMessage('Visible <span aria-hidden="true">(decorative)</span> text', { isHTML: true })
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Visible  text')
	})

	test('Node message skips aria-hidden subtrees in the announcement', async () => {
		const node = document.createElement('span')
		node.append('Uploaded ')
		const hidden = document.createElement('span')
		hidden.setAttribute('aria-hidden', 'true')
		hidden.textContent = '(icon)'
		node.append(hidden)
		node.append(' successfully')

		showMessage(node, { type: undefined })
		await waitForAnnouncement()

		const region = document.querySelector('[aria-live="polite"]') as HTMLElement
		expect(region.textContent).toBe('Uploaded  successfully')
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

	test('undo toast exposes both an Undo action and a Close button with distinct accessible names', () => {
		showUndo('Item deleted', vi.fn())

		const undoBtn = Array.from(document.querySelectorAll('button'))
			.find((btn) => btn.textContent?.trim() === 'Undo')
		const closeBtn = document.querySelector('button[aria-label="Close"]')

		expect(undoBtn).not.toBeUndefined()
		expect(closeBtn).not.toBeNull()
		expect(undoBtn).not.toBe(closeBtn)
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

// ---------------------------------------------------------------------------
// Auto-dismiss is paused while the user interacts with the stack (WCAG 2.2.1)
// ---------------------------------------------------------------------------

describe('pausing the auto-dismiss', () => {
	test('hovering a toast keeps it visible past its timeout', async () => {
		showMessage('Hovered', { timeout: 1000 })
		const toast = document.querySelector('[role="status"]') as HTMLElement

		pointerOver(toast)
		await vi.advanceTimersByTimeAsync(10_000)

		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})

	test('the countdown resumes once the pointer leaves the stack', async () => {
		showMessage('Hovered', { timeout: 1000 })
		const toast = document.querySelector('[role="status"]') as HTMLElement

		pointerOver(toast)
		await vi.advanceTimersByTimeAsync(10_000)
		pointerOut(toast)

		await vi.advanceTimersByTimeAsync(1000)
		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('the time already elapsed is not given back on resume', async () => {
		showMessage('Hovered', { timeout: 5000 })
		const toast = document.querySelector('[role="status"]') as HTMLElement

		// 1s of the 5s timeout is used up before pausing
		await vi.advanceTimersByTimeAsync(1000)
		pointerOver(toast)
		await vi.advanceTimersByTimeAsync(60_000)
		pointerOut(toast)

		// The remaining 4s – and not the full timeout – are left
		await vi.advanceTimersByTimeAsync(3999)
		expect(document.querySelector('[role="status"]')).not.toBeNull()
		await vi.advanceTimersByTimeAsync(1)
		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('a toast paused past its timeout stays for a moment after resuming', async () => {
		showMessage('Hovered', { timeout: 1000 })
		const toast = document.querySelector('[role="status"]') as HTMLElement

		// Only 100 ms would be left, which would be an instant disappearance
		await vi.advanceTimersByTimeAsync(900)
		pointerOver(toast)
		await vi.advanceTimersByTimeAsync(60_000)
		pointerOut(toast)

		await vi.advanceTimersByTimeAsync(999)
		expect(document.querySelector('[role="status"]')).not.toBeNull()
		await vi.advanceTimersByTimeAsync(1)
		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('moving the pointer inside the stack does not resume the countdown', async () => {
		showMessage('Hovered', { timeout: 1000 })
		const toast = document.querySelector('[role="status"]') as HTMLElement
		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLElement

		pointerOver(toast)
		// From the toast onto its own close button – still inside the stack
		pointerOut(toast, closeBtn)
		await vi.advanceTimersByTimeAsync(10_000)

		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})

	test('hovering one toast pauses the whole stack', async () => {
		showMessage('First', { timeout: 1000 })
		showMessage('Second', { timeout: 1000 })
		const [first] = Array.from(document.querySelectorAll('[role="status"]'))

		// Reading the first toast must not make the second one vanish
		pointerOver(first)
		await vi.advanceTimersByTimeAsync(10_000)

		expect(document.querySelectorAll('[role="status"]')).toHaveLength(2)
	})

	test('a toast added while the stack has focus starts out paused', async () => {
		showMessage('First', { timeout: 1000 })
		getStack().focus()

		showMessage('Second', { timeout: 1000 })
		await vi.advanceTimersByTimeAsync(10_000)

		expect(document.querySelectorAll('[role="status"]')).toHaveLength(2)
	})

	test('focusing the stack keeps toasts visible past their timeout', async () => {
		showMessage('Focused', { timeout: 1000 })
		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLElement

		closeBtn.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: document.body }))
		await vi.advanceTimersByTimeAsync(10_000)
		expect(document.querySelector('[role="status"]')).not.toBeNull()

		closeBtn.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
		await vi.advanceTimersByTimeAsync(1000)
		expect(document.querySelector('[role="status"]')).toBeNull()
	})

	test('a permanent toast is unaffected by hovering', async () => {
		showLoading('Uploading…')
		const toast = document.querySelector('[role="status"]') as HTMLElement

		pointerOver(toast)
		pointerOut(toast)
		await vi.advanceTimersByTimeAsync(100_000)

		expect(document.querySelector('[role="status"]')).not.toBeNull()
	})
})

// ---------------------------------------------------------------------------
// Reaching the toasts with the keyboard
// ---------------------------------------------------------------------------

describe('keyboard access to the stack', () => {
	test('the stack is a labelled region mentioning the shortcut while toasts are shown', async () => {
		showInfo('Reachable')
		await flushStackObserver()

		const stack = getStack()
		expect(stack.getAttribute('role')).toBe('region')
		expect(stack.getAttribute('aria-label')).toBe('Notifications (F6)')
	})

	test('the empty stack exposes no region so pages keep a clean landmark list', async () => {
		const handle = showInfo('Temporary')
		await flushStackObserver()
		expect(getStack().getAttribute('role')).toBe('region')

		handle.hideToast()
		await flushStackObserver()

		expect(getStack().getAttribute('role')).toBeNull()
		expect(getStack().getAttribute('aria-label')).toBeNull()
	})

	test('the shortcut moves the focus into the stack', async () => {
		showInfo('Reachable')
		await flushStackObserver()

		pressKey('F6')

		expect(document.activeElement).toBe(getStack())
	})

	test('the shortcut is ignored while no toast is shown', async () => {
		// Mount the container without leaving a toast in it
		showInfo('Gone').hideToast()
		await flushStackObserver()

		const outside = document.createElement('button')
		document.body.appendChild(outside)
		outside.focus()

		pressKey('F6')

		expect(document.activeElement).toBe(outside)
	})

	test('the shortcut is ignored when pressed with a modifier', async () => {
		showInfo('Reachable')
		await flushStackObserver()

		const outside = document.createElement('button')
		document.body.appendChild(outside)
		outside.focus()

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', ctrlKey: true, bubbles: true }))

		expect(document.activeElement).toBe(outside)
	})

	test('escape hands the focus back to where it came from', async () => {
		const outside = document.createElement('button')
		document.body.appendChild(outside)
		outside.focus()

		showInfo('Reachable')
		await flushStackObserver()
		pressKey('F6')
		expect(document.activeElement).toBe(getStack())

		pressKey('Escape', getStack())

		expect(document.activeElement).toBe(outside)
	})

	test('dismissing the focused toast hands the focus back instead of dropping it', async () => {
		const outside = document.createElement('button')
		document.body.appendChild(outside)
		outside.focus()

		showInfo('Closable')
		await flushStackObserver()
		pressKey('F6')

		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement
		closeBtn.focus()
		closeBtn.click()

		expect(document.querySelector('[role="status"]')).toBeNull()
		expect(document.activeElement).toBe(outside)
	})

	test('dismissing a toast keeps the focus in the stack while others remain', async () => {
		const outside = document.createElement('button')
		document.body.appendChild(outside)
		outside.focus()

		showInfo('First')
		showInfo('Second')
		await flushStackObserver()
		pressKey('F6')

		const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement
		closeBtn.focus()
		closeBtn.click()

		expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
		expect(document.activeElement).toBe(getStack())
	})
})

// ---------------------------------------------------------------------------
// Multiple toasts: stacking order
// ---------------------------------------------------------------------------

describe('multiple toasts', () => {
	test('toasts are appended to the stack in the order they were shown', () => {
		showInfo('First')
		showInfo('Second')
		showInfo('Third')

		const messages = Array.from(document.querySelectorAll('[role="status"]'))
			.map((el) => el.textContent?.trim())
		expect(messages).toEqual(['First', 'Second', 'Third'])
	})
})
