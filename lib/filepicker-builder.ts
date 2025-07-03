/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Node } from '@nextcloud/files'
import type { IFilePickerButton, IFilePickerButtonFactory, IFilePickerFilter } from './components/types.ts'

import IconMove from '@mdi/svg/svg/folder-move.svg?raw'
import IconCopy from '@mdi/svg/svg/folder-multiple.svg?raw'
import { basename } from '@nextcloud/paths'
import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import { n, t } from './utils/l10n.ts'
import { logger } from './utils/logger.ts'

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

/**
 * Error that is thrown in the rejected promise when the FilePicker was closed
 */
export class FilePickerClosed extends Error {}

export class FilePicker<IsMultiSelect extends boolean> {
	private title: string
	private multiSelect: IsMultiSelect
	private mimeTypeFilter: string[]
	private directoriesAllowed: boolean
	private buttons: IFilePickerButton[] | IFilePickerButtonFactory
	private path?: string
	private filter?: IFilePickerFilter
	private container?: string
	private disabledNavigation: boolean

	public constructor(
		title: string,
		multiSelect: IsMultiSelect,
		mimeTypeFilter: string[],
		directoriesAllowed: boolean,
		buttons: IFilePickerButton[] | IFilePickerButtonFactory,
		path?: string,
		filter?: IFilePickerFilter,
		container?: string,
		disabledNavigation = false,
	) {
		this.title = title
		this.multiSelect = multiSelect
		this.mimeTypeFilter = mimeTypeFilter
		this.directoriesAllowed = directoriesAllowed
		this.path = path
		this.filter = filter
		this.buttons = buttons
		this.container = container
		this.disabledNavigation = disabledNavigation
	}

	/**
	 * Pick files using the FilePicker.
	 *
	 * @return Promise with array of picked files or rejected promise on close without picking
	 */
	public async pickNodes(): Promise<Node[]> {
		const { default: FilePickerVue } = await import('./components/FilePicker/FilePicker.vue')

		const nodes = await spawnDialog(FilePickerVue, {
			allowPickDirectory: this.directoriesAllowed,
			buttons: this.buttons,
			name: this.title,
			path: this.path,
			mimetypeFilter: this.mimeTypeFilter,
			multiselect: this.multiSelect,
			filterFn: this.filter,
			disabledNavigation: this.disabledNavigation,
		}, {
			container: this.container,
		})

		if (!Array.isArray(nodes) || nodes.length === 0) {
			throw new FilePickerClosed('FilePicker: No nodes selected')
		}

		return nodes
	}

	/**
	 * Pick files using the FilePicker
	 *
	 * @return Promise with array of paths of picked files or rejected promise on close without picking
	 */
	public async pick(): Promise<IsMultiSelect extends true ? string[] : string> {
		const nodes = await this.pickNodes()
		if (this.multiSelect) {
			return nodes.map((node) => node.path) as (IsMultiSelect extends true ? string[] : string)
		}
		const path = nodes[0]?.path ?? '/'
		return path as (IsMultiSelect extends true ? string[] : string)
	}
}

export class FilePickerBuilder<IsMultiSelect extends boolean> {
	private title: string
	private multiSelect = false
	private mimeTypeFilter: string[] = []
	private directoriesAllowed = false
	private path?: string
	private filter?: IFilePickerFilter
	private buttons: IFilePickerButton[] | IFilePickerButtonFactory = []
	private container?: string
	private disabledNavigation = false

	/**
	 * Construct a new FilePicker
	 *
	 * @param title Title of the FilePicker
	 */
	public constructor(title: string) {
		this.title = title
	}

	/**
	 * Set the container where the FilePicker will be mounted
	 * By default 'body' is used
	 *
	 * @param container The dialog container
	 */
	public setContainer(container: string) {
		this.container = container
		return this
	}

	/**
	 * Enable or disable picking multiple files
	 *
	 * @param ms True to enable picking multiple files, false otherwise
	 */
	public setMultiSelect<T extends boolean>(ms: T) {
		this.multiSelect = ms
		return this as unknown as FilePickerBuilder<T extends true ? true : false>
	}

	/**
	 * Add allowed MIME type
	 *
	 * @param filter MIME type to allow
	 */
	public addMimeTypeFilter(filter: string) {
		this.mimeTypeFilter.push(filter)
		return this
	}

	/**
	 * Set allowed MIME types
	 *
	 * @param filter Array of allowed MIME types
	 */
	public setMimeTypeFilter(filter: string[]) {
		this.mimeTypeFilter = filter
		return this
	}

	/**
	 * Add a button to the FilePicker
	 * Note: This overrides any previous `setButtonFactory` call
	 *
	 * @param button The button
	 */
	public addButton(button: IFilePickerButton) {
		if (typeof this.buttons === 'function') {
			logger.warn('FilePicker buttons were set to factory, now overwritten with button object.')
			this.buttons = []
		}
		this.buttons.push(button)
		return this
	}

	/**
	 * Set the button factory which is used to generate buttons from current view, path and selected nodes
	 * Note: This overrides any previous `addButton` call
	 *
	 * @param factory The button factory
	 */
	public setButtonFactory(factory: IFilePickerButtonFactory) {
		this.buttons = factory
		return this
	}

	/**
	 * Set FilePicker type based on legacy file picker types
	 *
	 * @param type The legacy filepicker type to emulate
	 * @deprecated Use `addButton` or `setButtonFactory` instead as with setType you do not know which button was pressed
	 */
	public setType(type: FilePickerType) {
		this.buttons = (nodes, path) => {
			const buttons: IFilePickerButton[] = []
			const node = nodes?.[0]?.attributes?.displayName || nodes?.[0]?.basename
			const target = node || basename(path)

			if (type === FilePickerType.Choose) {
				let label = t('Choose')
				if (nodes.length === 1) {
					label = t('Choose {file}', { file: node })
				} else if (this.multiSelect) {
					label = n('Choose %n file', 'Choose %n files', nodes.length)
				}
				buttons.push({
					callback: () => {},
					label,
					variant: 'primary',
				})
			}
			if (type === FilePickerType.CopyMove || type === FilePickerType.Copy) {
				buttons.push({
					callback: () => {},
					label: target ? t('Copy to {target}', { target }) : t('Copy'),
					icon: IconCopy,
					variant: 'primary',
				})
			}
			if (type === FilePickerType.Move || type === FilePickerType.CopyMove) {
				buttons.push({
					callback: () => {},
					label: target ? t('Move to {target}', { target }) : t('Move'),
					icon: IconMove,
					variant: type === FilePickerType.Move ? 'primary' : 'secondary',
				})
			}
			return buttons
		}

		return this
	}

	/**
	 * Allow to pick directories besides files
	 *
	 * @param allow True to allow picking directories
	 */
	public allowDirectories(allow = true) {
		this.directoriesAllowed = allow
		return this
	}

	/**
	 * Set starting path of the FilePicker
	 *
	 * @param path Path to start from picking
	 */
	public startAt(path: string) {
		this.path = path
		return this
	}

	/**
	 * Add filter function to filter file list of FilePicker
	 *
	 * @param filter Filter function to apply
	 */
	public setFilter(filter: IFilePickerFilter) {
		this.filter = filter
		return this
	}

	/**
	 * Disable navigation (view selection)
	 */
	public disableNavigation() {
		this.disabledNavigation = true
		return this
	}

	/**
	 * Construct the configured FilePicker
	 */
	public build() {
		return new FilePicker<IsMultiSelect>(
			this.title,
			this.multiSelect as IsMultiSelect,
			this.mimeTypeFilter,
			this.directoriesAllowed,
			this.buttons,
			this.path,
			this.filter,
			this.container,
			this.disabledNavigation,
		)
	}
}

/**
 *
 * @param title Title of the file picker
 */
export function getFilePickerBuilder(title: string): FilePickerBuilder<boolean> {
	return new FilePickerBuilder(title)
}
