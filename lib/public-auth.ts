/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { PublicAuthPromptProps } from './components/PublicAuthPrompt.vue'

import { defineAsyncComponent } from 'vue'
import { spawnDialog } from '@nextcloud/vue/functions/dialog'

/**
 * Show the public auth prompt dialog
 * This is used to ask the current user their nickname
 * as well as show some additional contextual information
 * @param props The props to pass to the dialog, see PublicAuthPrompt.vue for details
 */
export function showGuestUserPrompt(props: PublicAuthPromptProps) {
	return new Promise((resolve) => {
		spawnDialog(
			defineAsyncComponent(() => import('./components/PublicAuthPrompt.vue')),
			props,
			resolve,
		)
	})
}
