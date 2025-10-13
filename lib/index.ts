/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export {
	type ConflictPickerOptions,
	type ConflictResolutionResult,

	openConflictPicker,
} from './conflict-picker.ts'

export {
	FilePicker,
	FilePickerBuilder,
	FilePickerClosed,
	FilePickerType,
	getFilePickerBuilder,
} from './filepicker-builder.ts'

export {
	type GuestUserPromptOptions,

	showGuestUserPrompt,
} from './public-auth.ts'

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

export {
	Dialog,
	DialogBuilder,
	getDialogBuilder,
	showConfirmation,
} from './dialogs.ts'

export type {
	IDialogButton,
	IDialogSeverity,
	IFilePickerButton,
	IFilePickerFilter,
} from './components/types.ts'
