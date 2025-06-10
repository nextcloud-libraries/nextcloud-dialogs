/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { PublicAuthPromptProps } from './components/PublicAuthPrompt.vue'

import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import { defineAsyncComponent } from 'vue'

export type GuestUserPromptOptions = PublicAuthPromptProps

/**
 * Show the public auth prompt dialog
 * This is used to ask the current user their nickname
 * as well as show some additional contextual information
 *
 * @param props - The props to pass to the dialog
 * @return The selected name or undefined if dialog was closed
 */
export async function showGuestUserPrompt(props: GuestUserPromptOptions): Promise<string | undefined> {
	const name = await spawnDialog(
		defineAsyncComponent(() => import('./components/PublicAuthPrompt.vue')),
		props,
	)
	return name
}
