/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { INode, Node } from '@nextcloud/files'

export enum DialogSeverity {
	Info = 'info',
	Warning = 'warning',
	Error = 'error',
}

/**
 * Interface for defining buttons passed to the Dialog component
 * See NcDialogButton
 */
export interface IDialogButton {
	/** Label of the button */
	label: string

	/** Callback on button click */
	callback: () => void

	/**
	 * Disabled state of the button
	 * @default false
	 */
	disabled?: boolean

	/**
	 * Optional Icon for the button
	 * Should be a SVG image as raw string
	 */
	icon?: string,

	/**
	 * Button type
	 * @deprecated - use `variant` instead
	 * @see https://nextcloud-vue-components.netlify.app/#/Components/NcButton
	 */
	type?: 'primary' | 'secondary' | 'error' | 'warning' | 'success'

	/**
	 * Button type
	 * @see https://nextcloud-vue-components.netlify.app/#/Components/NcButton
	 */
	variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success'
}

/**
 * Interface to define buttons of the FilePicker component
 * The buttons are based on the Dialog buttons but the callback gets the array of selected nodes
 */
export interface IFilePickerButton extends Omit<IDialogButton, 'callback'> {
	/**
	 * Callback on button click
	 *
	 * @param nodes Array of `@nextcloud/files` Nodes that were selected
	 */
	callback: (nodes: Node[]) => void
}

export type IFilePickerButtonFactory = (selectedNodes: Node[], currentPath: string, currentView: string) => IFilePickerButton[]

/**
 * Type of filter functions to filter the FilePicker's file list
 */
export type IFilePickerFilter = (node: Node) => boolean

/**
 * Type of functions to allow or not picking a node
 */
export type IFilePickerCanPick = (node: INode) => boolean
