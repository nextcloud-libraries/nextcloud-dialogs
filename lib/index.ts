/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
	showLoading,
} from './toast.js'

export type {
	ToastOptions,
} from './toast.js'

export { spawnDialog } from './utils/dialogs.js'

export {
	Dialog,
	DialogBuilder,
	getDialogBuilder,
} from './dialogs'

export type {
	IDialogButton,
	IDialogSeverity,
	IFilePickerButton,
	IFilePickerFilter,
} from './components/types.js'
