/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IDialogButton, ISeverity } from './components/types'
import type Vue from 'vue'

import GenericDialog from './components/GenericDialog.vue'
import { spawnDialog } from './utils/dialogs'

/**
 * This class provides generic Nextcloud themed dialogs
 */
export class Dialog {

	#name: string
	#text: string
	#buttons: IDialogButton[]
	#severity?: ISeverity
	#dialog?: Vue

	/** @deprecated */
	#html?: string

	constructor(
		name: string,
		text: string,
		buttons: IDialogButton[] = [],
		severity?: ISeverity,
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
 */
export class DialogBuilder {

	#severity?: ISeverity
	#text: string
	#name: string
	#buttons: IDialogButton[]

	constructor() {
		this.#severity = undefined
		this.#text = ''
		this.#name = ''
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
	setSeverity(severity: ISeverity) {
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
