/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { onBeforeMount, ref } from "vue"

/**
 * Check whether the component is mounted in a public share
 */
export const useIsPublic = () => {
	const checkIsPublic = () => (document.getElementById('isPublic') as HTMLInputElement|null)?.value === '1'
	
	const isPublic = ref(true)
	onBeforeMount(() => { isPublic.value = checkIsPublic() })

	return {
		isPublic,
	}
}
