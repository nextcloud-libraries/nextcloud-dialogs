/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IDialogButton } from './components/types'
import type Vue from 'vue'

import { DialogSeverity } from './components/types'
import { spawnDialog } from './utils/dialogs'
import GenericDialog from './components/GenericDialog.vue'

export { DialogSeverity } from './components/types'

/**
 * This class provides generic Nextcloud themed dialogs
 */
export class Dialog {

	#name: string
	#text: string
	#buttons: IDialogButton[]
	#severity?: DialogSeverity
	#dialog?: Vue

	/** @deprecated */
	#html?: string

	constructor(
		name: string,
		text: string,
		buttons: IDialogButton[] = [],
		severity?: DialogSeverity,
	) {
		this.#name = name
		this.#text = text
		this.#buttons = buttons
		this.#severity = severity
		this.#dialog = undefined
		this.#html = undefined
	}

	/**
	 * @deprecated DO NOT USE! It will be removed in the near future!
	 * @param html HTML content
	 */
	setHTML(html: string) {
		this.#html = html
		return this
	}

	/**
	 * Spawn and show the dialog - if already open the previous instance will be destroyed
	 * @return Promise that resolves when the dialog is answered successfully and rejects on close
	 */
	show() {
		if (this.#dialog) {
			this.#dialog.$destroy()
		}

		return new Promise((resolve) => {
			this.#dialog = spawnDialog(GenericDialog,
				{
					buttons: this.#buttons,
					name: this.#name,
					text: this.#text,
					severity: this.#severity,
					html: this.#html,
				},
				resolve,
			)
		})
	}

	/**
	 * Hide and destroy the current dialog instance
	 */
	hide() {
		this.#dialog?.$destroy()
	}

}

/**
 * The DialogBuilder provides an easy to use interface for creating simple dialogs in consistent Nextcloud design
 *
 * @example
 * ```ts
 * // It is recommended to use `getDialogBuilder` instead
 * const dialogBuilder = new DialogBuilder('The dialog title')
 * const dialog = dialogBuilder
 *     .setText('The dialog message')
 *     .setSeverity(DialogSeverity.Warning)
 *     .addButton({
 *         label: 'Ok',
 *         callback: () => console.warn('Warning was dismissed'),
 *     })
 *     .build()
 * ```
 */
export class DialogBuilder {

	#severity?: DialogSeverity
	#text: string
	#name: string
	#buttons: IDialogButton[]

	constructor(name?: string) {
		this.#severity = undefined
		this.#text = ''
		this.#name = name ?? ''
		this.#buttons = []
	}

	/**
	 * Set dialog name
	 * @param name The name or headline of the dialog
	 */
	setName(name: string) {
		this.#name = name
		return this
	}

	/**
	 * Set the dialog text
	 * @param text Main text of the dialog
	 */
	setText(text: string) {
		this.#text = text
		return this
	}

	/**
	 * Set the severity of the dialog
	 * @param severity Severity of the dialog
	 */
	setSeverity(severity: DialogSeverity) {
		this.#severity = severity
		return this
	}

	/**
	 * Set buttons from array
	 * @param buttons Either an array of dialog buttons
	 */
	setButtons(buttons: IDialogButton[]) {
		if (this.#buttons.length > 0) {
			console.warn('[@nextcloud/dialogs] Dialog buttons are already set - this overrides previous buttons.')
		}
		this.#buttons = buttons
		return this
	}

	/**
	 * Add a single button
	 * @param button Button to add
	 */
	addButton(button: IDialogButton) {
		this.#buttons.push(button)
		return this
	}

	build() {
		return new Dialog(this.#name, this.#text, this.#buttons, this.#severity)
	}

}

/**
 * Get the dialog builder to create a new dialog
 *
 * @param name The name of the dialog (title)
 * @example
 * ```ts
 * const dialog = getDialogBuilder('Confirm action')
 *     .addButton({
 *         label: 'Ok',
 *         callback: () => console.warn('confirmed'),
 *     })
 *     .build()
 * ```
 */
export function getDialogBuilder(name: string) {
	return new DialogBuilder(name)
}
