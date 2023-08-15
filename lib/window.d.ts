/// <reference types="@nextcloud/typings" />
export {}

declare global {
	interface Window {
		OC: Nextcloud.v27.OC
	}
}
