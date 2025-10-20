/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { GettextTranslation, GettextTranslationBundle } from '@nextcloud/l10n/gettext'

import { getGettextBuilder } from '@nextcloud/l10n/gettext'

const gtBuilder = getGettextBuilder()
	.detectLanguage()

for (const data of __TRANSLATIONS__) {
	const { language, translations } = data as { language: string, translations: GettextTranslation[] }
	const bundle: GettextTranslationBundle = {
		headers: {},
		translations: {
			'': Object.fromEntries(translations.map((translation: GettextTranslation) => [translation.msgid, translation])),
		},
	}
	gtBuilder.addTranslation(language, bundle)
}

const gt = gtBuilder.build()

export const n = gt.ngettext.bind(gt) as typeof gt.ngettext
export const t = gt.gettext.bind(gt) as typeof gt.gettext
