/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { AsyncComponent, Component } from 'vue'

import Vue, { toRaw } from 'vue'

/**
 * Helper to spawn a Vue dialog without having to mount it from a component
 *
 * @param dialog The dialog component to spawn
 * @param props Properties to pass to the dialog
 * @param onClose Callback when the dialog is closed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spawnDialog = (dialog: Component | AsyncComponent, props: any, onClose: (...rest: unknown[]) => void = () => {}): Vue => {
	const el = document.createElement('div')

	const container: HTMLElement = document.querySelector(props?.container) || document.body
	container.appendChild(el)

	const vue = new Vue({
		el,
		name: 'VueDialogHelper',
		render: (h) =>
			h(dialog, {
				props,
				on: {
					close: (...rest: unknown[]) => {
						onClose(...rest.map(v => toRaw(v)))
						vue.$destroy()
					},
				},
			}),
	})
	return vue
}
