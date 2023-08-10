<template>
	<NcButton :aria-label="props.label" :type="props.type" @click="handleClick">
		{{ props.label }}
		<template v-if="props.icon !== undefined" #icon>
			<component :is="props.icon" :size="20" />
		</template>
	</NcButton>
</template>

<script setup lang="ts">
import type { AsyncComponent, Component } from 'vue'
import { NcButton } from '@nextcloud/vue'

export interface IDialogButton {
    label: string,
    icon?: Component | AsyncComponent,
    callback: () => void,
    type?: 'primary' | 'secondary' | 'error' | 'warning' | 'success'
}

const props = defineProps<IDialogButton>()
const emit = defineEmits<(e: 'click', event: MouseEvent) => void>()

const handleClick = (e: MouseEvent) => {
	props.callback?.()
	emit('click', e)
}

</script>
