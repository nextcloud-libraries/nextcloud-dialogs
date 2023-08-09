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

/**
 * This file provides legacy wrappers which wrap the new Vue based dialogs for old style `OC.dialogs` calls.
 */

/// <reference types="@nextcloud/typings" />
import type { IFilePickerButton } from './components/FilePicker/FilePicker.vue'
import type { Node } from '@nextcloud/files'
import type { AsyncComponent, Component } from 'vue'

import { t } from './l10n'
import { FilePickerVue, FilePickerType } from '.'
import DialogBase from './components/DialogBase.vue'
import Vue from 'vue'

/**
 * Helper to spawn a Vue dialog without having to mount it from a component
 *
 * @param dialog The dialog component to spawn
 * @param props Properties to pass to the dialog
 * @param onClose Callback when the dialog is closed
 */
const spawnDialog = (dialog: Component | AsyncComponent, props: any, onClose: () => void = () => {}) => {
	const el = document.createElement('div')

	const container: HTMLElement = document.querySelector(props?.container) || document.body
	container.appendChild(el)

	const vue = new Vue({
		el,
		name: 'VueDialogHelper',
		render: (h) =>
			h(dialog, {
				props,
				on: {
					close: () => {
						onClose()
						vue.$destroy()
					},
				},
			}),
	})
}

/**
 * Legacy wrapper to support `OC.dialogs.filepicker` with the new Vue based filepicker
 *
 * Prefer to use the filepicker directly instead.
 *
 * In order to pick several types of mime types they need to be passed as an
 * array of strings.
 *
 * When no mime type filter is given only files can be selected. In order to
 * be able to select both files and folders "['*', 'httpd/unix-directory']"
 * should be used instead.
 *
 * @param {string} title dialog title
 * @param {function} callback which will be triggered when user presses Choose
 * @param {boolean} [multiselect] whether it should be possible to select multiple files
 * @param {string[]} [mimetype] mimetype to filter by - directories will always be included
 * @param {boolean} [_modal] do not use
 * @param {string} [type] Type of file picker : Choose, copy, move, copy and move
 * @param {string} [path] path to the folder that the the file can be picket from
 * @param {Object} [options] additonal options that need to be set
 * @param {Function} [options.filter] filter function for advanced filtering
 */
export async function filepicker(title: string, callback: (s: string | string[], type: FilePickerType) => void, multiselect = false, mimetype?: string | string[], _modal?: boolean, type?: FilePickerType, path?: string, options?: any) {

	/**
	 * Create legacy callback wrapper to support old filepicker syntax
	 * @param fn The original callback
	 * @param type The file picker type which was used to pick the file(s)
	 */
	const legacyCallback = (fn: (s: string| string[], type: FilePickerType) => void, type: FilePickerType) => {
		const getPath = (node: Node) => {
			const root = node?.root || ''
			let path = node?.path || ''
			// TODO: Fix this in @nextcloud/files
			if (path.startsWith(root)) {
				path = path.slice(root.length) || '/'
			}
			return path
		}

		if (multiselect) {
			return (nodes: Node[]) => fn(nodes.map(getPath), type)
		} else {
			return (nodes: Node[]) => fn(getPath(nodes[0]), type)
		}
	}

	/**
	 * Coverting a Node into a legacy file info to support the OC.dialogs.filepicker filter function
	 * @param node The node to convert
	 */
	const nodeToLegacyFile = (node: Node): Nextcloud.v19.FileInfo => ({
		id: node.fileid || null,
		path: node.path,
		mimetype: node.mime || null,
		mtime: node.mtime?.getTime() || null,
		permissions: (node.permissions as number) as Nextcloud.Common.Permission,
		name: node.attributes?.displayname || node.basename,
		etag: node.attributes?.etag || null,
		hasPreview: node.attributes?.hasPreview || null,
		mountType: node.attributes?.mountType || null,
		quotaAvailableBytes: node.attributes?.quotaAvailableBytes || null,
		icon: null,
		sharePermissions: null,
	})

	const buttons: IFilePickerButton[] = []
	if (type === FilePickerType.Choose) {
		buttons.push({
			label: t('Choose'),
			type: 'primary',
			callback: legacyCallback(callback, FilePickerType.Choose),
		})
	} else if (type === FilePickerType.Copy || type === FilePickerType.CopyMove) {
		buttons.push({
			label: t('Copy'),
			callback: legacyCallback(callback, FilePickerType.Copy),
		})
	}
	if (type === FilePickerType.CopyMove || type === FilePickerType.Move) {
		buttons.push({
			label: t('Move'),
			type: 'primary',
			callback: legacyCallback(callback, FilePickerType.Move),
		})
	}
	if (type === FilePickerType.Custom) {
		(options.buttons || []).forEach((button) => {
			buttons.push({
				callback: legacyCallback(callback, button.type),
				label: button.text,
				type: button.defaultButton ? 'primary' : 'secondary',
			})
		})
	}

	const filter = {} as any
	if (typeof options?.filter === 'function') {
		filter.filterFn = (node: Node) => options.filter(nodeToLegacyFile(node))
	}

	const mimetypeFilter = typeof mimetype === 'string' ? [mimetype] : (mimetype || [])

	// eslint-disable-next-line n/no-callback-literal
	spawnDialog(FilePickerVue, {
		...filter,
		name: title,
		buttons,
		multiselect,
		path,
		mimetypeFilter,
		allowPickDirectory: options?.allowDirectoryChooser === true || mimetypeFilter.includes('httpd/unix-directory'),
	})
}

/**
 * displays confirmation dialog
 * @param text content of dialog
 * @param title dialog title
 * @param callback Callback which will be triggered when user presses OK (true or false would be passed to callback respectively)
 * @param modal Do not use
 * @return {Promise}
 */
export async function confirm(text: string, title: string, callback: (s: boolean) => void, modal?: never) {
	const buttons = [
		{
			label: 'No',
			// eslint-disable-next-line n/no-callback-literal
			callback: () => callback(false),
		},
		{
			label: 'Yes',
			type: 'primary',
			// eslint-disable-next-line n/no-callback-literal
			callback: () => callback(true),
		},
	]
	// eslint-disable-next-line n/no-callback-literal
	spawnDialog(DialogBase, { name: title, message: text, buttons, size: 'small' }, () => callback(false))
}
