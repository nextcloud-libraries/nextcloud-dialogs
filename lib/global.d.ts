/**
 * SPDX-FileCopyrightText: 2022-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { GettextTranslation } from '@nextcloud/l10n/gettext'

declare global {
	// Allow injected by vite
	const __TRANSLATIONS__: {
		language: string
		translations: GettextTranslation[]
	}[]
}
