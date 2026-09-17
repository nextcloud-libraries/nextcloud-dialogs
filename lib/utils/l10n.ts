/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { GettextTranslation, GettextTranslationBundle } from '@nextcloud/l10n/gettext'

import { getLanguage } from '@nextcloud/l10n'
import { getGettextBuilder } from '@nextcloud/l10n/gettext'

const currentLanguage = getLanguage().replace('-', '_')
const gtBuilder = getGettextBuilder()
	.setLanguage(currentLanguage)

// eslint-disable-next-line @stylistic/semi
const translations = __TRANSLATIONS__;

const languages = translations.map(({ language }) => language)
const useBaseLanguage = !languages.includes(currentLanguage)
for (const data of translations) {
	const { language, translations } = data as { language: string, translations: GettextTranslation[] }
	const needsRename = useBaseLanguage && currentLanguage === language.split('_')[0]
	if (language === currentLanguage || language === 'en' || needsRename) {
		const bundle: GettextTranslationBundle = {
			headers: {},
			translations: {
				'': Object.fromEntries(translations.map((translation: GettextTranslation) => [translation.msgid, translation])),
			},
		}
		gtBuilder.addTranslation(needsRename ? currentLanguage : language, bundle)
	}
}

const gt = gtBuilder.build()

export const n = gt.ngettext.bind(gt) as typeof gt.ngettext
export const t = gt.gettext.bind(gt) as typeof gt.gettext
