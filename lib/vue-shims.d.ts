/**
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
declare module '*.vue' {
	import Vue from 'vue'
	export default Vue
}

declare module '@nextcloud/vue/components/*' {
	import Vue from 'vue'
	export default Vue
}

declare module '@nextcloud/vue/functions/dialogs' {
	import type { Component, AsyncComponent } from 'vue'
	interface DialogProps {
		[index: string]: unknown
		container?: string
	}
	function spawnDialog(dialog: Component | AsyncComponent, props: DialogProps | undefined, onClose: (...rest: unknown[]) => void): Vue
	export {
		spawnDialog,
	}
}
