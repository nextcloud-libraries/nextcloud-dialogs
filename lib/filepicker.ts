/**
 * @copyright Copyright (c) 2023 Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
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
 *
 */

import type { IFilePickerButton } from './components/types'
import type { Node } from '@nextcloud/files'

import { spawnDialog } from './utils/dialogs'
import { FilePickerVue } from './components/FilePicker/index'
import { t } from './utils/l10n'

/**
 * Type of filter functions to filter the FilePicker's file list
 */
export type FilePickerFilter = (node: Node) => boolean

/**
 * @deprecated
 */
export enum FilePickerType {
	Choose = 1,
	Move = 2,
	Copy = 3,
	CopyMove = 4,
	Custom = 5,
}

export class FilePicker {

	private title: string
	private multiSelect: boolean
	private mimeTypeFilter: string[]
	private directoriesAllowed: boolean
	private buttons: IFilePickerButton[]
	private path?: string
	private filter?: FilePickerFilter

	public constructor(title: string,
		multiSelect: boolean,
		mimeTypeFilter: string[],
		directoriesAllowed: boolean,
		buttons: IFilePickerButton[],
		path?: string,
		filter?: FilePickerFilter) {
		this.title = title
		this.multiSelect = multiSelect
		this.mimeTypeFilter = mimeTypeFilter
		this.directoriesAllowed = directoriesAllowed
		this.path = path
		this.filter = filter
		this.buttons = buttons
	}

	/**
	 * Pick files using the FilePicker
	 *
	 * @return Promise with array of picked files or rejected promise on close without picking
	 */
	public async pick(): Promise<string[]> {
		return new Promise((resolve, reject) => {
			const buttons = this.buttons.map((button) => ({
				...button,
				callback: (nodes: Node[]) => {
					button.callback(nodes)
					resolve(nodes.map((node) => node.path))
				},
			}))

			spawnDialog(FilePickerVue, {
				allowPickDirectory: this.directoriesAllowed,
				buttons,
				name: this.title,
				path: this.path,
				mimetypeFilter: this.mimeTypeFilter,
				multiselect: this.multiSelect,
				filterFn: this.filter,
			}, reject)
		})
	}

}

export class FilePickerBuilder {

	private title: string
	private multiSelect = false
	private mimeTypeFilter: string[] = []
	private directoriesAllowed = false
	private path?: string
	private filter?: FilePickerFilter
	private buttons: IFilePickerButton[] = []

	/**
	 * Construct a new FilePicker
	 *
	 * @param title Title of the FilePicker
	 */
	public constructor(title: string) {
		this.title = title
	}

	/**
	 * Enable or disable picking multiple files
	 *
	 * @param ms True to enable picking multiple files, false otherwise
	 */
	public setMultiSelect(ms: boolean): FilePickerBuilder {
		this.multiSelect = ms
		return this
	}

	/**
	 * Add allowed MIME type
	 *
	 * @param filter MIME type to allow
	 */
	public addMimeTypeFilter(filter: string): FilePickerBuilder {
		this.mimeTypeFilter.push(filter)
		return this
	}

	/**
	 * Set allowed MIME types
	 *
	 * @param filter Array of allowed MIME types
	 */
	public setMimeTypeFilter(filter: string[]): FilePickerBuilder {
		this.mimeTypeFilter = filter
		return this
	}

	/**
	 * Add a button to the FilePicker
	 *
	 * @param button The button
	 */
	public addButton(button: IFilePickerButton): FilePickerBuilder {
		this.buttons.push(button)
		return this
	}

	/**
	 * Set FilePicker type based on legacy file picker types
	 * @param type The legacy filepicker type to emulate
	 * @deprecated Use `addButton` instead as with setType you do not know which button was pressed
	 */
	public setType(type: FilePickerType): FilePickerBuilder {
		this.buttons = []

		if (type === FilePickerType.CopyMove || type === FilePickerType.Copy) {
			this.buttons.push({
				callback: () => {},
				label: t('Copy'),
				type: 'primary',
			})
		} else if (type === FilePickerType.Move) {
			this.buttons.push({
				callback: () => {},
				label: t('Move'),
				type: 'primary',
			})
		} else if (type === FilePickerType.Choose) {
			this.buttons.push({
				callback: () => {},
				label: t('Choose'),
				type: 'primary',
			})
		}

		if (type === FilePickerType.CopyMove) {
			this.buttons.push({
				callback: () => {},
				label: t('Move'),
				type: 'secondary',
			})
		}

		return this
	}

	/**
	 * Allow to pick directories besides files
	 *
	 * @param allow True to allow picking directories
	 */
	public allowDirectories(allow = true): FilePickerBuilder {
		this.directoriesAllowed = allow
		return this
	}

	/**
	 * Set starting path of the FilePicker
	 *
	 * @param path Path to start from picking
	 */
	public startAt(path: string): FilePickerBuilder {
		this.path = path
		return this
	}

	/**
	 * Add filter function to filter file list of FilePicker
	 *
	 * @param filter Filter function to apply
	 */
	public setFilter(filter: FilePickerFilter): FilePickerBuilder {
		this.filter = filter
		return this
	}

	/**
	 * Construct the configured FilePicker
	 */
	public build(): FilePicker {
		return new FilePicker(
			this.title,
			this.multiSelect,
			this.mimeTypeFilter,
			this.directoriesAllowed,
			this.buttons,
			this.path,
			this.filter,
		)
	}

}

/**
 *
 * @param title Title of the file picker
 */
export function getFilePickerBuilder(title: string): FilePickerBuilder {
	return new FilePickerBuilder(title)
}
