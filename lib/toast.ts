/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import ToastNotification from './components/ToastNotification.vue'
import { t } from './utils/l10n.js'

/**
 * Persistent aria-live regions that exist in the DOM before any toast is shown.
 * Screen readers require the live region to already be present when content is added;
 * injecting an element that already carries aria-live is unreliable (NVDA, JAWS).
 */
let _politeRegion: HTMLElement | null = null
let _assertiveRegion: HTMLElement | null = null

const VISUALLY_HIDDEN_STYLE = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'

/**
 * Get or create a persistent live region element for the given aria-live level.
 * The returned element is visually hidden but will be announced by
 * screen readers when its text content changes.
 *
 * @param level The aria-live level ('polite' or 'assertive') to determine which live region to use
 * @return The live region HTMLElement
 */
function getOrCreateLiveRegion(level: 'polite' | 'assertive'): HTMLElement {
	const cached = level === 'assertive' ? _assertiveRegion : _politeRegion
	if (cached && document.body.contains(cached)) {
		return cached
	}

	const region = document.createElement('div')
	region.setAttribute('aria-live', level)
	region.setAttribute('aria-atomic', 'true')
	region.setAttribute('aria-relevant', 'additions text')
	region.style.cssText = VISUALLY_HIDDEN_STYLE
	document.body.appendChild(region)

	if (level === 'assertive') {
		_assertiveRegion = region
	} else {
		_politeRegion = region
	}
	return region
}

/**
 * Announce a message to the appropriate live region for screen readers, based on the given aria-live level.
 *
 * @param text The message text to announce
 * @param level The aria-live level ('polite' or 'assertive') to determine which live region to use for the announcement
 */
function announceToLiveRegion(text: string, level: 'polite' | 'assertive'): void {
	const region = getOrCreateLiveRegion(level)
	// Clear first so the same message announced twice is re-read
	region.textContent = ''
	setTimeout(() => {
		region.textContent = text
	}, 50)
}

/**
 * Extract visible text from a node, skipping subtrees marked aria-hidden.
 * This prevents decorative elements (e.g. spinner SVGs) from leaking into
 * the live-region announcement.
 *
 * @param node The DOM node to extract text from
 * @return The concatenated visible text content of the node and its children
 */
function getVisibleText(node: Node): string {
	// Skip any nodes that are hidden from assistive technologies
	if (node instanceof Element && node.getAttribute('aria-hidden') === 'true') {
		return ''
	}

	// For text nodes, return the text content directly
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent ?? ''
	}

	// For element nodes, recursively extract text from child nodes
	return Array.from(node.childNodes).map(getVisibleText).join('')
}

/**
 * Enum of available Toast types
 */
export enum ToastType {
	ERROR = 'toast-error',
	WARNING = 'toast-warning',
	INFO = 'toast-info',
	SUCCESS = 'toast-success',
	UNDO = 'toast-undo',
	LOADING = 'toast-loading',
}

/** @deprecated Use ToastAriaLive.OFF */
export const TOAST_ARIA_LIVE_OFF = 'off'
/** @deprecated Use ToastAriaLive.POLITE */
export const TOAST_ARIA_LIVE_POLITE = 'polite'
/** @deprecated Use ToastAriaLive.ASSERTIVE */
export const TOAST_ARIA_LIVE_ASSERTIVE = 'assertive'

export enum ToastAriaLive {
	OFF = TOAST_ARIA_LIVE_OFF,
	POLITE = TOAST_ARIA_LIVE_POLITE,
	ASSERTIVE = TOAST_ARIA_LIVE_ASSERTIVE,
}

/** Timeout in ms of an undo toast */
export const TOAST_UNDO_TIMEOUT = 10000
/** Default timeout in ms of toasts */
export const TOAST_DEFAULT_TIMEOUT = 7000
/** Timeout value to show a toast permanently */
export const TOAST_PERMANENT_TIMEOUT = -1

export interface ToastOptions {
	/**
	 * Defines the timeout in milliseconds after which the toast is closed. Set to -1 to have a persistent toast.
	 */
	timeout?: number

	/**
	 * Set to true to allow HTML content inside of the toast text
	 *
	 * @default false
	 */
	isHTML?: boolean

	/**
	 * Set a type of {ToastType} to style the modal
	 */
	type?: ToastType

	/**
	 * Provide a function that is called after the toast is removed
	 */
	onRemove?: () => void

	/**
	 * Provide a function that is called when the toast is clicked
	 */
	onClick?: () => void

	/**
	 * Make the toast closable
	 */
	close?: boolean

	/**
	 * Specify the element to attach the toast element to (for testing)
	 */
	selector?: string

	/**
	 * Whether the messages should be announced to screen readers.
	 * See the following docs for an explanation when to use which:
	 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
	 *
	 * By default, errors and undo toasts are announced assertive; others are polite.
	 */
	ariaLive?: ToastAriaLive
}

/**
 * Handle returned by all show* functions, allowing the toast to be hidden programmatically.
 */
export interface ToastHandle {
	hideToast(): void
}

// The container element for toasts. Shared across all toasts to ensure they stack together. Created on demand.
let _container: HTMLElement | null = null

/**
 * Get the container element for toasts, creating it if it doesn't exist.
 * If a selector is provided, it tries to find an existing element matching
 * the selector and uses it as the container; otherwise, it falls back to
 * a default container appended to the body.
 *
 * @param selector Optional CSS selector to find an existing container element
 * @return The container HTMLElement for toasts
 */
function getContainer(selector?: string): HTMLElement {
	if (selector) {
		const el = document.querySelector<HTMLElement>(selector)
		if (el) {
			return el
		}
	}
	if (_container && document.body.contains(_container)) {
		return _container
	}
	_container = document.createElement('div')
	_container.className = 'nc-toast-container'
	document.body.appendChild(_container)
	return _container
}

interface _InternalProps {
	message: string | Node
	isHTML: boolean
	type: ToastType | undefined
	timeout: number
	close: boolean
	role: 'alert' | 'status'
	selector: string | undefined
	onRemove: (() => void) | undefined
	onClick: (() => void) | undefined
	onUndo: ((e: MouseEvent) => void) | undefined
}

/**
 * Mount a toast notification component with the given properties, and return a handle to control it.
 *
 * @param internal The internal properties for the toast, including message, type, timeout, callbacks, etc.
 */
function _mountToast(internal: _InternalProps): ToastHandle {
	const container = getContainer(internal.selector)

	// display:contents so the wrapper does not affect the flex layout of the container
	const wrapper = document.createElement('div')
	wrapper.style.cssText = 'display:contents'
	container.appendChild(wrapper)

	const app = createApp(ToastNotification, {
		message: internal.message,
		isHTML: internal.isHTML,
		type: internal.type,
		timeout: internal.timeout,
		close: internal.close,
		role: internal.role,
		onClick: internal.onClick,
		onUndo: internal.onUndo,
		onDismiss: () => {
			internal.onRemove?.()
			app.unmount()
			wrapper.remove()
		},
	})

	const vm = app.mount(wrapper) as unknown as { hide(): void }

	return {
		hideToast: () => vm.hide(),
	}
}

/**
 * Show a toast message
 *
 * @param data Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showMessage(data: string | Node, options?: ToastOptions): ToastHandle {
	const opts = {
		timeout: TOAST_DEFAULT_TIMEOUT,
		isHTML: false,
		type: undefined as ToastType | undefined,
		selector: undefined as string | undefined,
		onRemove: undefined as (() => void) | undefined,
		onClick: undefined as (() => void) | undefined,
		close: true,
		ariaLive: undefined as ToastAriaLive | undefined,
		...options,
	}

	// Strip HTML from plain-text messages to prevent XSS
	if (typeof data === 'string' && !opts.isHTML) {
		const el = document.createElement('div')
		el.innerHTML = data
		data = el.innerText
	}

	// Resolve aria-live level: explicit option > type default > polite
	let ariaLive: ToastAriaLive = ToastAriaLive.POLITE
	if (opts.ariaLive) {
		ariaLive = opts.ariaLive
	} else if (opts.type === ToastType.ERROR || opts.type === ToastType.UNDO) {
		ariaLive = ToastAriaLive.ASSERTIVE
	}

	// Announce to the persistent live region.
	// Prefix with a translated type label so the colour-coded border cue is also
	// conveyed to screen readers (WCAG 1.4.1).
	if (ariaLive !== ToastAriaLive.OFF) {
		const text = typeof data === 'string' ? data : getVisibleText(data as Node)
		const typeTemplates: Partial<Record<ToastType, string>> = {
			[ToastType.ERROR]: t('Error: {message}', { message: text }),
			[ToastType.WARNING]: t('Warning: {message}', { message: text }),
			[ToastType.INFO]: t('Info: {message}', { message: text }),
			[ToastType.SUCCESS]: t('Success: {message}', { message: text }),
		}
		const announcement = (opts.type && typeTemplates[opts.type]) ?? text
		announceToLiveRegion(announcement, ariaLive === ToastAriaLive.ASSERTIVE ? 'assertive' : 'polite')
	}

	return _mountToast({
		message: data,
		isHTML: opts.isHTML,
		type: opts.type,
		timeout: opts.timeout,
		close: opts.close,
		role: ariaLive === ToastAriaLive.ASSERTIVE ? 'alert' : 'status',
		selector: opts.selector,
		onRemove: opts.onRemove,
		onClick: opts.onClick,
		onUndo: undefined,
	})
}

/**
 * Show a toast message with error styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showError(text: string, options?: ToastOptions): ToastHandle {
	return showMessage(text, { ...options, type: ToastType.ERROR })
}

/**
 * Show a toast message with warning styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showWarning(text: string, options?: ToastOptions): ToastHandle {
	return showMessage(text, { ...options, type: ToastType.WARNING })
}

/**
 * Show a toast message with info styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showInfo(text: string, options?: ToastOptions): ToastHandle {
	return showMessage(text, { ...options, type: ToastType.INFO })
}

/**
 * Show a toast message with success styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showSuccess(text: string, options?: ToastOptions): ToastHandle {
	return showMessage(text, { ...options, type: ToastType.SUCCESS })
}

/**
 * Show a toast message with a loading spinner.
 * The toast is permanent, call hideToast() on the returned handle to remove it.
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options ToastOptions
 */
export function showLoading(text: string, options?: ToastOptions): ToastHandle {
	return showMessage(text, {
		...options,
		close: false,
		timeout: TOAST_PERMANENT_TIMEOUT,
		type: ToastType.LOADING,
	})
}

/**
 * Show a toast message with undo styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param onUndo Function that is called when the undo button is clicked
 * @param options ToastOptions
 */
export function showUndo(text: string, onUndo: (e: MouseEvent) => void, options?: ToastOptions): ToastHandle {
	if (!(onUndo instanceof Function)) {
		throw new Error('Please provide a valid onUndo method')
	}

	// UNDO defaults to assertive; the caller can override via the ariaLive option
	const ariaLive = options?.ariaLive ?? ToastAriaLive.ASSERTIVE

	if (ariaLive !== ToastAriaLive.OFF) {
		announceToLiveRegion(text, ariaLive === ToastAriaLive.ASSERTIVE ? 'assertive' : 'polite')
	}

	return _mountToast({
		message: text,
		isHTML: false,
		type: ToastType.UNDO,
		timeout: TOAST_UNDO_TIMEOUT,
		close: options?.close ?? true,
		role: ariaLive === ToastAriaLive.ASSERTIVE ? 'alert' : 'status',
		selector: options?.selector,
		onRemove: options?.onRemove,
		onClick: options?.onClick,
		onUndo,
	})
}
