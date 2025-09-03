/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { InvalidFilenameError, InvalidFilenameErrorReason, validateFilename } from '@nextcloud/files'
import { t } from '../utils/l10n.ts'

/**
 * Get the validity of a filename (empty if valid).
 * This can be used for `setCustomValidity` on input elements
 *
 * @param name The filename
 */
export function getGuestNameValidity(name: string): string {
	if (name.trim() === '') {
		return t('Names must not be empty.')
	}

	if (name.startsWith('.')) {
		return t('Names must not start with a dot.')
	}

	if (name.length > 64) {
		return t('Names may be at most 64 characters long.')
	}

	try {
		validateFilename(name)
		return ''
	} catch (error) {
		if (!(error instanceof InvalidFilenameError)) {
			throw error
		}

		switch (error.reason) {
			case InvalidFilenameErrorReason.Character:
				return t('"{char}" is not allowed inside a name.', { char: error.segment })
			case InvalidFilenameErrorReason.ReservedName:
				return t('"{segment}" is a reserved name and not allowed.', { segment: error.segment })
			case InvalidFilenameErrorReason.Extension:
				if (error.segment.match(/\.[a-z]/i)) {
					return t('"{extension}" is not an allowed name.', { extension: error.segment })
				}
				return t('Names must not end with "{extension}".', { extension: error.segment })
			default:
				return t('Invalid name.')
		}
	}
}
