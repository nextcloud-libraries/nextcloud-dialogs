/**
 * @copyright Copyright (c) 2019 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import Toastify from 'toastify-js'
import { t } from './l10n.js'

class ToastType {
	static readonly ERROR = 'toast-error';
	static readonly WARNING = 'toast-warning';
	static readonly INFO = 'toast-info';
	static readonly SUCCESS = 'toast-success';
	static readonly PERMANENT = 'toast-error';
	static readonly UNDO = 'toast-undo';
}

export const TOAST_ARIA_LIVE_OFF = 'off'
export const TOAST_ARIA_LIVE_POLITE = 'polite'
export const TOAST_ARIA_LIVE_ASSERTIVE = 'assertive'

class ToastAriaLive {
	static readonly OFF = TOAST_ARIA_LIVE_OFF;
	static readonly POLITE = TOAST_ARIA_LIVE_POLITE;
	static readonly ASSERTIVE = TOAST_ARIA_LIVE_ASSERTIVE;
}

export const TOAST_UNDO_TIMEOUT = 10000
export const TOAST_DEFAULT_TIMEOUT = 7000
export const TOAST_PERMANENT_TIMEOUT = -1

export interface ToastOptions {
	/**
	 * Defines the timeout in milliseconds after which the toast is closed. Set to -1 to have a persistent toast.
	 */
	timeout?: number

	/**
	 * Set to true to allow HTML content inside of the toast text
	 * @default false
	 */
	isHTML?: Boolean

	/**
	 * Set a type of {ToastType} to style the modal
	 */
	type?: ToastType

	/**
	 * Provide a function that is called after the toast is removed
	 */
	onRemove?: Function

	/**
	 * Provide a function that is called when the toast is clicked
	 */
	onClick?: Function

	/**
	 * Make the toast closable
	 */
	close?: Boolean

	/**
	 * Specify the element to attach the toast element to (for testing)
	 */
	selector?: string

	/**
	 * Whether the messages should be announced to screen readers.
	 * See {ToastAriaLive} for types
	 * See the following docs for an explanation when to use which:
	 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
	 *
	 * By default, errors are announced assertive and other messages "polite".
	 */
	ariaLive?: ToastAriaLive
}

/**
 * Show a toast message
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showMessage(data: string|Node, options?: ToastOptions): Toast {
	options = Object.assign({
		timeout: TOAST_DEFAULT_TIMEOUT,
		isHTML: false,
		type: undefined,
		// An undefined selector defaults to the body element
		selector: undefined,
		onRemove: () => { },
		onClick: undefined,
		close: true
	}, options)

	if (typeof data === 'string' && !options.isHTML) {
		// fime mae sure that text is extracted
		const element = document.createElement('div')
		element.innerHTML = data
		data = element.innerText
	}
	let classes = options.type ?? ''

	if (typeof options.onClick === 'function') {
		classes += ' toast-with-click '
	}

	const isNode = data instanceof Node

	let ariaLive = ToastAriaLive.POLITE
	if (options.ariaLive) {
		ariaLive = options.ariaLive.toString()
	} else if (options.type === ToastType.ERROR || options.type === ToastType.UNDO) {
		ariaLive = ToastAriaLive.ASSERTIVE
	}

	const toast = Toastify({
		[!isNode ? 'text' : 'node']: data,
		duration: options.timeout,
		callback: options.onRemove,
		onClick: options.onClick,
		close: options.close,
		gravity: 'top',
		selector: options.selector,
		position: 'right',
		backgroundColor: '',
		className: 'dialogs ' + classes,
		escapeMarkup: !options.isHTML,
		ariaLive,
	})

	toast.showToast()

	return toast
}

/**
 * Show a toast message with error styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showError(text: string, options?: ToastOptions): Toast {
	return showMessage(text, { ...options, type: ToastType.ERROR })
}

/**
 * Show a toast message with warning styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showWarning(text: string, options?: ToastOptions): Toast {
	return showMessage(text, { ...options, type: ToastType.WARNING })
}

/**
 * Show a toast message with info styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showInfo(text: string, options?: ToastOptions): Toast {
	return showMessage(text, { ...options, type: ToastType.INFO })
}

/**
 * Show a toast message with success styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showSuccess(text: string, options?: ToastOptions): Toast {
	return showMessage(text, { ...options, type: ToastType.SUCCESS })
}

/**
 * Show a toast message with undo styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param onUndo Function that is called when the undo button is clicked
 * @param options
 */
export function showUndo(text: string, onUndo: Function, options?: ToastOptions): Toast {
	// onUndo callback is mandatory
	if (!(onUndo instanceof Function)) {
		throw new Error('Please provide a valid onUndo method')
	}

	let toast

	options = Object.assign(options || {}, {
		// force 10 seconds of timeout
		timeout: TOAST_UNDO_TIMEOUT,
		// remove close button
		close: false
	})

	// Generate undo layout
	const undoContent = document.createElement('span')
	const undoButton = document.createElement('button')
	undoContent.classList.add('toast-undo-container')
	undoButton.classList.add('toast-undo-button')
	undoButton.innerText = t('Undo')
	undoContent.innerText = text
	undoContent.appendChild(undoButton)

	undoButton.addEventListener('click', function(event) {
		event.stopPropagation()
		onUndo(event)

		// Hide toast
		if (toast?.hideToast instanceof Function) {
			toast.hideToast()
		}
	})

	toast = showMessage(undoContent, { ...options, type: ToastType.UNDO })
	return toast
}
