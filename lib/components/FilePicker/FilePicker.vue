<template>
	<DialogBase v-bind="dialogProps" @close="emit('close')">
		<template #navigation="{ isCollapsed }">
			<FilePickerNavigation :is-collapsed="isCollapsed" :current-view.sync="currentView" :filter-string.sync="filterString" />
		</template>

		<div class="file-picker__main">
			<!-- Header title / file list breadcrumbs -->
			<FilePickerBreadcrumbs v-if="currentView === 'files'"
				:path.sync="currentPath"
				:show-menu="allowPickDirectory"
				@create-node="onCreateFolder"/>
			<div v-else class="file-picker__view">
				<h3>{{ viewHeadline }}</h3>
			</div>

			<!-- File list -->
			<FileList :allow-pick-directory="allowPickDirectory"
				:files="filteredFiles"
				:multiselect="multiselect"
				:loading="isLoading"
				:path.sync="currentPath"
				:selected-files.sync="selectedFiles"
				:name="viewHeadline"
				@update:path="currentView = 'files'" />
		</div>
	</DialogBase>
</template>

<script setup lang="ts">
import type { IDialogButton } from '../DialogButton.vue'
import { davRootPath, type Node } from '@nextcloud/files'

import DialogBase from '../DialogBase.vue'
import FileList from './FileList.vue'
import FilePickerBreadcrumbs from './FilePickerBreadcrumbs.vue'
import FilePickerNavigation from './FilePickerNavigation.vue'

import { t } from '../../l10n'
import { join } from 'path'
import { computed, onMounted, ref, toRef } from 'vue'
import { useDAVFiles } from '../../usables/dav'
import { useMimeFilter } from '../../usables/mime'
import { showError } from '../../toast'

export interface IFilePickerButton extends Omit<IDialogButton, 'callback'> {
	callback: (nodes: Node[]) => void
}

const props = withDefaults(defineProps<{
	/** Buttons to be displayed */
	buttons: IFilePickerButton[]

	/** The name of file picker dialog (heading) */
	name: string

	/**
	 * Can directories be picked
	 * @default false
	 */
	allowPickDirectory?: boolean

	/**
	 * Where to mount the dialog
	 * @default 'body'
	 */
	container?: string

	/**
	 * Custom filter function used to filter pickable files
	 */
	 filterFn?: (node: Node) => boolean

	/**
	 * List of allowed mime types
	 * You can use placeholders for e.g. allowing all subtypes of images `['image/*']`.
	 * Note that if unset all files are allowed, which is the same as passing `['*∕*']`
	 * @default []
	 */
	mimetypeFilter?: string[]

	/**
	 * Is it allowed to pick multiple files
	 * @default true
	 */
	multiselect?: boolean

	/**
	 * The initial path of the file picker
	 * @default '/'
	 */
	 path?: string
}>(), {
	allowPickDirectory: false,
	container: 'body',
	filterFn: undefined,
	mimetypeFilter: () => [],
	multiselect: true,
	path: '/',
})

const emit = defineEmits<{
	(e: 'close'): void
}>()

/**
 * Props to be passed to the underlying Dialog component
 */
const dialogProps = computed(() => ({
	container: props.container,
	name: props.name,
	buttons: dialogButtons.value,
	size: 'large',
	navigationClasses: ['file-picker__navigation'],
}))

/**
 * Map buttons to Dialog buttons by wrapping the callback function to pass the selected files
 */
const dialogButtons = computed(() => [...props.buttons].map(button => ({
	...button,
	callback: async () => {
		const nodes = selectedFiles.value.length === 0 && props.allowPickDirectory ? [await getFile(currentPath.value)] : selectedFiles.value as Node[]
		return button.callback(nodes)
	},
})))

/**
 * Name of the currently active view
 */
const currentView = ref<'files' | 'favorites' | 'recent'>('files')

/**
 * Headline to be used on the current view
 */
const viewHeadline = computed(() => currentView.value === 'favorites' ? t('Favorites') : (currentView.value === 'recent' ? t('Recent') : ''))

/**
 * All currently selected files
 */
const selectedFiles = ref<Node[]>([])

/**
 * Last path navigated to using the file picker
 * (required as sessionStorage is not reactive)
 */
const savedPath = ref(window?.sessionStorage.getItem('NC.FilePicker.LastPath') || '/')

/**
 * The path the user manually navigated to using this filepicker instance
 */
const navigatedPath = ref<string>()

/**
 * The current path that should be picked from
 */
const currentPath = computed({
	// Only use the path for the files view as favorites and recent only works on the root
	get: () => currentView.value === 'files' ? navigatedPath.value || props.path || savedPath.value : '/',
	/**
	 * Navigate to the new path and save it to the session storage
	 *
	 * @param path The new path
	 */
	set: (path: string) => {
		if (props.path === undefined) {
			window.sessionStorage.setItem('NC.FilePicker.LastPath', path)
		}
		navigatedPath.value = path
	},
})

/**
 * A string used to filter files in current view
 */
const filterString = ref('')

const { isSupportedMimeType } = useMimeFilter(toRef(props, 'mimetypeFilter')) // vue 3.3 will allow cleaner syntax of toRef(() => props.mimetypeFilter)

const { files, isLoading, loadFiles, getFile, client } = useDAVFiles(currentView, currentPath)

onMounted(() => loadFiles())

/**
 * The files list filtered by the current value of the filter input
 */
const filteredFiles = computed(() => {
	let filtered = files.value

	if (props.mimetypeFilter.length > 0) {
		// filter by mime type but always include folders to navigate
		filtered = filtered.filter(file => file.type === 'folder' || (file.mime && isSupportedMimeType(file.mime)))
	}
	if (filterString.value) {
		filtered = filtered.filter((file) => file.basename.toLowerCase().includes(filterString.value.toLowerCase()))
	}
	if (props.filterFn) {
		filtered = filtered.filter((f) => props.filterFn(f as Node))
	}
	return filtered
})

/**
 * Handle creating new folder (breadcrumb menu)
 * @param name The new folder name
 */
const onCreateFolder = (name: string) => {
	client
		.createDirectory(join(davRootPath, currentPath.value, name))
		// reload file list
		.then(() => loadFiles())
		// show error to user
		.catch((e) => showError(t('Could not create the new folder')))
}
</script>

<script lang="ts">
export default {
	name: 'FilePicker',
}
</script>

<style scoped lang="scss">
.file-picker {
	display: flex;
	flex-direction: row;
	min-height: 40vh;
	gap: 22px;

	&__view {
		height: 50px; // align with breadcrumbs
		display: flex;
		justify-content: start;
		align-items: center;

		h3 {
			font-weight: bold;
			height: fit-content;
			margin: 0;
		}
	}

	&__main {
		width: 100%;
	}
}
</style>