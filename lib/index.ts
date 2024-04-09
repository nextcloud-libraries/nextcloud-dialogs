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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

export {
	FilePicker,
	FilePickerClosed,
	FilePickerType,
	FilePickerBuilder,
	getFilePickerBuilder,
} from './filepicker-builder'

export {
	ToastAriaLive,
	ToastType,
	TOAST_UNDO_TIMEOUT,
	TOAST_DEFAULT_TIMEOUT,
	TOAST_PERMANENT_TIMEOUT,
	TOAST_ARIA_LIVE_OFF,
	TOAST_ARIA_LIVE_POLITE,
	TOAST_ARIA_LIVE_ASSERTIVE,
	showMessage,
	showSuccess,
	showWarning,
	showInfo,
	showError,
	showUndo,
} from './toast.js'

export type {
	ToastOptions,
} from './toast.js'

export { spawnDialog } from './utils/dialogs.js'

export {
	Dialog,
	DialogBuilder,
} from './dialogs'

export type { IFilePickerButton, IFilePickerFilter } from './components/types.js'
