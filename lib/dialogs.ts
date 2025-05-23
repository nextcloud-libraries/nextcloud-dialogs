/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IDialogButton, IDialogSeverity } from './components/types.ts'

import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import GenericDialog from './components/GenericDialog.vue'
import { logger } from './utils/logger.ts'

export type * from './components/types.ts'

/**
 * This class provides generic Nextcloud themed dialogs
 */
export class Dialog {
	#name: string
	#text: string
	#buttons: IDialogButton[]
	#severity?: IDialogSeverity

	/** @deprecated */
	#html?: string

	constructor(
		name: string,
		text: string,
		buttons: IDialogButton[] = [],
		severity?: IDialogSeverity,
	) {
		this.#name = name
		this.#text = text
		this.#buttons = buttons
		this.#severity = severity
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
	 *
	 * @return Promise that resolves when the dialog is answered successfully and rejects on close
	 */
	async show() {
		const result = await spawnDialog(
			GenericDialog,
			{
				buttons: this.#buttons,
				name: this.#name,
				text: this.#text,
				severity: this.#severity,
				html: this.#html,
			},
		)
		if (!result) {
			throw new Error('Dialog closed')
		}
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
	#severity?: IDialogSeverity
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
	 *
	 * @param name The name or headline of the dialog
	 */
	setName(name: string) {
		this.#name = name
		return this
	}

	/**
	 * Set the dialog text
	 *
	 * @param text Main text of the dialog
	 */
	setText(text: string) {
		this.#text = text
		return this
	}

	/**
	 * Set the severity of the dialog
	 *
	 * @param severity Severity of the dialog
	 */
	setSeverity(severity: IDialogSeverity) {
		this.#severity = severity
		return this
	}

	/**
	 * Set buttons from array
	 *
	 * @param buttons Either an array of dialog buttons
	 */
	setButtons(buttons: IDialogButton[]) {
		if (this.#buttons.length > 0) {
			logger.warn('[@nextcloud/dialogs] Dialog buttons are already set - this overrides previous buttons.')
		}
		this.#buttons = buttons
		return this
	}

	/**
	 * Add a single button
	 *
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
