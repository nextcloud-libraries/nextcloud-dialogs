<template>
	<NcButton :aria-label="props.label" :type="props.type" @click="handleClick">
		{{ props.label }}
		<template v-if="props.icon !== undefined" #icon>
			<NcIconSvgWrapper v-if="typeof props.icon === 'string'" :svg="props.icon" />
			<component :is="props.icon" v-else :size="20" />
		</template>
	</NcButton>
</template>

<script setup lang="ts">
import type { IDialogButton } from './types'
import { NcButton, NcIconSvgWrapper } from '@nextcloud/vue'

// with vue 3.3:
// const props = defineProps<IDialogButton>()

const props = withDefaults(defineProps<{
	callback: IDialogButton['callback'],
	label: IDialogButton['label'],
	icon?: IDialogButton['icon'],
	type?: IDialogButton['type'],
}>(), {
	icon: undefined,
	type: 'secondary',
})

const emit = defineEmits<(e: 'click', event: MouseEvent) => void>()

const handleClick = (e: MouseEvent) => {
	props.callback?.()
	emit('click', e)
}

</script>
