/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export {
	FilePicker,
	FilePickerBuilder,
	FilePickerClosed,
	FilePickerType,
	getFilePickerBuilder,
} from './filepicker-builder'

export {
	showError,
	showInfo,
	showLoading,
	showMessage,
	showSuccess,
	showUndo,
	showWarning,
	TOAST_ARIA_LIVE_ASSERTIVE,
	TOAST_ARIA_LIVE_OFF,
	TOAST_ARIA_LIVE_POLITE,
	TOAST_DEFAULT_TIMEOUT,
	TOAST_PERMANENT_TIMEOUT,
	TOAST_UNDO_TIMEOUT,
	ToastAriaLive,
	ToastType,
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
