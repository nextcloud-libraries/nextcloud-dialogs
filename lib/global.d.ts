/**
 * SPDX-FileCopyrightText: 2022-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { GettextTranslationBundle } from '@nextcloud/l10n/gettext'

declare const __TRANSLATIONS__: { locale: string, json: GettextTranslationBundle }[]

// Allow css modules
declare module '*.module.css';
declare module '*.module.scss';
