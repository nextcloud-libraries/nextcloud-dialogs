/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * This entry points provides access to the FilePicker Vue component and its type definitions
 *
 * @deprecated The file picker Vue export will be removed in a future version. Please only use the file picker builder.
 */

export { FilePickerVue } from './components/FilePicker/index.js'
export type { IFilePickerButton, IFilePickerButtonFactory, IFilePickerFilter } from './components/types.js'
