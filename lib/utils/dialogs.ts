/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { spawnDialog as _spawnDialog } from '@nextcloud/vue/functions/dialogs'

/**
 * Helper to spawn a Vue dialog without having to mount it from a component
 *
 * @deprecated Use `spawnDialog` from `@nextcloud/vue` instead
 */
export const spawnDialog = _spawnDialog
