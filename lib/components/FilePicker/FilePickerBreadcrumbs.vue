<template>
	<NcBreadcrumbs class="file-picker__breadcrumbs">
		<template #default>
			<NcBreadcrumb :name="t('Home')"
				:title="t('Home')"
				@click="emit('update:path', '/')">
				<template #icon>
					<IconFolder :size="20" />
				</template>
			</NcBreadcrumb>
			<NcBreadcrumb v-for="dir in pathElements"
				:key="dir.path"
				:name="dir.name"
				:title="dir.path"
				@click="emit('update:path', dir.path)" />
		</template>
		<template v-if="showMenu" #actions>
			<NcActions :aria-label="t('Create directory')"
				:force-menu="true"
				type="tertiary"
				@close="newNodeName = ''">
				<template #icon>
					<IconPlus :size="20" />
				</template>
				<NcActionInput :value.sync="newNodeName"
					:label="t('New folder')"
					:placeholder="t('New folder name')"
					@submit="onSubmit">
					<template #icon>
						<IconHome :size="20" />
					</template>
				</NcActionInput>
			</NcActions>
		</template>
	</NcBreadcrumbs>
</template>

<script setup lang="ts">
import IconHome from 'vue-material-design-icons/Home.vue'
import IconPlus from 'vue-material-design-icons/Plus.vue'

import { NcActions, NcActionInput, NcBreadcrumbs, NcBreadcrumb } from '@nextcloud/vue'
import { computed, ref } from 'vue'
import { t } from '../../l10n'

const props = defineProps<{
	/** Current path to display */
	path: string
	/** Whether to show the "new node" menu or not */
	showMenu: boolean
}>()

const emit = defineEmits<{
	/**
	 * Triggered when the path was changed by using the breadcrumbs
	 */
	(e: 'update:path', path: string): void
	/**
	 * Triggered when a new directory on the current path should be created
	 */
	(e: 'create-node', name: string): void
}>()

/**
 * Input on the "new node" menu
 */
const newNodeName = ref('')

/**
 * Handle creating a new node
 */
const onSubmit = function() {
	emit('create-node', newNodeName.value)
	newNodeName.value = ''
}

/**
 * Split current path and provide the path and the basename
 */
const pathElements = computed(() => props.path.split('/')
	.filter((v) => v !== '')
	.map((v, i, elements) => ({
		name: v,
		path: '/' + elements.slice(0, i + 1).join('/'),
	})),
)
</script>
