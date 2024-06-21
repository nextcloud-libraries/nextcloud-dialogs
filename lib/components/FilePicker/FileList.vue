<template>
	<div ref="fileContainer" class="file-picker__files">
		<table>
			<thead>
				<tr>
					<th v-if="multiselect" class="row-checkbox">
						<span class="hidden-visually">
							{{ t('Select entry') }}
						</span>
						<NcCheckboxRadioSwitch v-if="multiselect"
							:aria-label="t('Select all entries')"
							:checked="allSelected"
							data-testid="select-all-checkbox"
							@update:checked="onSelectAll" />
					</th>
					<th :aria-sort="sortByName" class="row-name">
						<div class="header-wrapper">
							<span class="file-picker__header-preview" />
							<NcButton :wide="true"
								type="tertiary"
								data-test="file-picker_sort-name"
								@click="toggleSortByName">
								<template #icon>
									<IconSortAscending v-if="sortByName === 'ascending'" :size="20" />
									<IconSortDescending v-else-if="sortByName === 'descending'" :size="20" />
									<span v-else style="width: 44px" />
								</template>
								{{ t('Name') }}
							</NcButton>
						</div>
					</th>
					<th :aria-sort="sortBySize" class="row-size">
						<NcButton :wide="true" type="tertiary" @click="toggleSortBySize">
							<template #icon>
								<IconSortAscending v-if="sortBySize === 'ascending'" :size="20" />
								<IconSortDescending v-else-if="sortBySize === 'descending'" :size="20" />
								<span v-else style="width: 44px" />
							</template>
							{{ t('Size') }}
						</NcButton>
					</th>
					<th :aria-sort="sortByModified" class="row-modified">
						<NcButton :wide="true" type="tertiary" @click="toggleSortByModified">
							<template #icon>
								<IconSortAscending v-if="sortByModified === 'ascending'" :size="20" />
								<IconSortDescending v-else-if="sortByModified === 'descending'" :size="20" />
								<span v-else style="width: 44px" />
							</template>
							{{ t('Modified') }}
						</NcButton>
					</th>
				</tr>
			</thead>
			<tbody>
				<template v-if="loading">
					<LoadingTableRow v-for="index in skeletonNumber" :key="index" :show-checkbox="multiselect" />
				</template>
				<template v-else>
					<FileListRow v-for="file in sortedFiles"
						:key="file.fileid || file.path"
						:allow-pick-directory="allowPickDirectory"
						:show-checkbox="multiselect"
						:can-pick="multiselect || selectedFiles.length === 0 || selectedFiles.includes(file)"
						:selected="selectedFiles.includes(file)"
						:node="file"
						@update:selected="onNodeSelected(file)"
						@enter-directory="onChangeDirectory" />
				</template>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import { FileType, type Node } from '@nextcloud/files'

import { getCanonicalLocale } from '@nextcloud/l10n'
import { NcButton, NcCheckboxRadioSwitch } from '@nextcloud/vue'
import { t } from '../../utils/l10n'
import { computed, nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'

import IconSortAscending from 'vue-material-design-icons/MenuUp.vue'
import IconSortDescending from 'vue-material-design-icons/MenuDown.vue'
import LoadingTableRow from './LoadingTableRow.vue'
import FileListRow from './FileListRow.vue'

const props = defineProps<{
	multiselect: boolean
	allowPickDirectory: boolean
	loading: boolean
	files: Node[]
	selectedFiles: Node[]
	path: string
}>()

const emit = defineEmits<{
	(e: 'update:path', path: string): void
	(e: 'update:selectedFiles', nodes: Node[]): void
}>()

type ISortingOptions = 'ascending' | 'descending' | undefined

const sortByName = ref<ISortingOptions>('ascending')
const sortBySize = ref<ISortingOptions>(undefined)
const sortByModified = ref<ISortingOptions>(undefined)

const ordering = {
	ascending: <T, >(a: T, b: T, fn: (a: T, b: T) => number) => fn(a, b),
	descending: <T, >(a: T, b: T, fn: (a: T, b: T) => number) => fn(b, a),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	none: <T, >(a: T, b: T, fn: (a: T, b: T) => number) => 0,
}

const byName = (a: Node, b: Node) => (a.attributes?.displayName || a.basename).localeCompare(b.attributes?.displayName || b.basename, getCanonicalLocale())
const bySize = (a: Node, b: Node) => (b.size || 0) - (a.size || 0)
const byDate = (a: Node, b: Node) => (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0)

const toggleSorting = (variable: Ref<ISortingOptions>) => {
	const old = variable.value
	// reset
	sortByModified.value = sortBySize.value = sortByName.value = undefined

	if (old === 'ascending') {
		variable.value = 'descending'
	} else {
		variable.value = 'ascending'
	}
}

const toggleSortByName = () => toggleSorting(sortByName)
const toggleSortBySize = () => toggleSorting(sortBySize)
const toggleSortByModified = () => toggleSorting(sortByModified)

/**
 * Files sorted by columns
 */
const sortedFiles = computed(() => [...props.files].sort(
	(a, b) =>
		// Folders always come above the files
		(b.type === FileType.Folder ? 1 : 0) - (a.type === FileType.Folder ? 1 : 0)
		// Favorites above other files
		// (b.attributes?.favorite || false) - (a.attributes?.favorite || false) ||
		// then sort by name / size / modified
		|| ordering[sortByName.value || 'none'](a, b, byName)
		|| ordering[sortBySize.value || 'none'](a, b, bySize)
		|| ordering[sortByModified.value || 'none'](a, b, byDate),
))

/**
 * Contains the selectable files, filtering out directories if `allowPickDirectory` is not set
 */
const selectableFiles = computed(() => props.files.filter((file) => props.allowPickDirectory || file.type !== FileType.Folder))

/**
 * Whether all selectable files are currently selected
 */
const allSelected = computed(() => !props.loading && props.selectedFiles.length > 0 && props.selectedFiles.length >= selectableFiles.value.length)

/**
 * Handle the "select all" checkbox
 */
function onSelectAll() {
	if (props.selectedFiles.length < selectableFiles.value.length) {
		// If not all selected, select all
		emit('update:selectedFiles', selectableFiles.value)
	} else {
		// If already all selected, deselect all
		emit('update:selectedFiles', [])
	}
}

function onNodeSelected(file: Node) {
	if (props.selectedFiles.includes(file)) {
		emit('update:selectedFiles', props.selectedFiles.filter((f) => f.path !== file.path))
	} else {
		if (props.multiselect) {
			emit('update:selectedFiles', [...props.selectedFiles, file])
		} else {
			// no multi select so only this file is selected
			emit('update:selectedFiles', [file])
		}
	}
}

function onChangeDirectory(dir: Node) {
	emit('update:path', dir.path)
}

/**
 * Number of loading skeletons to use to fill the filepicker
 */
const skeletonNumber = ref(4)
const fileContainer = ref<HTMLDivElement>()
{
	const resize = () => nextTick(() => {
		const nodes = fileContainer.value?.parentElement?.children || []
		let height = fileContainer.value?.parentElement?.clientHeight || 450
		for (let index = 0; index < nodes.length; index++) {
			if (!fileContainer.value?.isSameNode(nodes[index])) {
				height -= nodes[index].clientHeight
			}
		}
		// container height - 50px table header / row height of 50px
		skeletonNumber.value = Math.max(1, Math.floor((height - 50) / 50))
	})
	onMounted(() => {
		window.addEventListener('resize', resize)
		resize()
	})
	onUnmounted(() => {
		window.removeEventListener('resize', resize)
	})
}
</script>

<style scoped lang="scss">
.file-picker {
	&__header-preview {
		width: 22px; // 32px - 16px padding of button + 6px padding in file list rows
		height: 32px;
		flex: 0 0 auto; // do not shrink or grow
	}

	&__files {
		// ensure focus outlines are visible
		margin: 2px;
		margin-inline-start: 12px; // align with bread crumbs
		overflow: scroll auto;

		table {
			width: 100%;
			max-height: 100%;
			table-layout: fixed;
		}
		th {
			position: sticky;
			z-index: 1; // show on top of scrolled content rows
			top: 0;
			background-color: var(--color-main-background);
			// ensure focus outline of buttons is visible
			padding: 2px;

			.header-wrapper {
				display: flex;
			}

			&.row-checkbox {
				width: 44px;
			}
			&.row-name {
				width: 230px;
			}
			&.row-size {
				width: 100px;
			}
			&.row-modified {
				width: 120px;
			}
		}

		// >> begin of hacks for table header sorting buttons
		// TODO: Remove this hack after ... is available
		th:not(.row-size) {
			:deep(.button-vue__wrapper) {
				justify-content: start;
				flex-direction: row-reverse;
			}
			:deep(.button-vue) {
				padding-inline: 16px 4px;
			}
		}
		th.row-size :deep(.button-vue__wrapper) {
			justify-content: end;
		}
		th :deep(.button-vue__wrapper) {
			color: var(--color-text-maxcontrast);

			.button-vue__text {
				font-weight: normal;
			}
		}
		// << end of hacks
	}
}
</style>
