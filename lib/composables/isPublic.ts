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
