<template>
	<div class="file-picker__files">
		<table>
			<thead>
				<tr>
					<th class="row-checkbox">
						<span class="hidden-visually">
							{{ t('Select entry') }}
						</span>
						<NcCheckboxRadioSwitch v-if="props.multiselect" :aria-label="t('Select all entries')" :checked="allSelected" @update:checked="onSelectAll" />
					</th>
					<th :aria-sort="sortByName" class="row-name">
						<NcButton :wide="true" type="tertiary" @click="toggleSortByName">
							<template #icon>
								<IconSortAscending v-if="sortByName === 'ascending'" :size="20" />
								<IconSortDescending v-else-if="sortByName === 'descending'" :size="20" />
								<span v-else style="width: 44px" />
							</template>
							{{ t('Name') }}
						</NcButton>
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
					<LoadingTableRow v-for="i in [1, 2, 3, 4]" :key="i" />
				</template>
				<template v-else>
					<FileListRow v-for="file in sortedFiles"
						:key="file.fileid || file.path"
						:allow-pick-directory="allowPickDirectory"
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
import type { Node } from '@nextcloud/files'

import { getCanonicalLocale } from '@nextcloud/l10n'
import { NcButton, NcCheckboxRadioSwitch } from '@nextcloud/vue'
import { join } from 'path'
import { t } from '../../utils/l10n'
import { computed, ref, type Ref } from 'vue'

import IconSortAscending from 'vue-material-design-icons/MenuDown.vue'
import IconSortDescending from 'vue-material-design-icons/MenuUp.vue'
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

const sortByName = ref<ISortingOptions>(undefined)
const sortBySize = ref<ISortingOptions>(undefined)
const sortByModified = ref<ISortingOptions>(undefined)

const ordering = {
	ascending: <T>(a: T, b: T, fn: (a: T, b: T) => number) => fn(a, b),
	descending: <T>(a: T, b: T, fn: (a: T, b: T) => number) => fn(b, a),
	none: <T>(a: T, b: T, fn: (a: T, b: T) => number) => 0,
}

const byName = (a: Node, b: Node) => b.basename.localeCompare(a.basename, getCanonicalLocale())
const bySize = (a: Node, b: Node) => (b.size || 0) - (a.size || 0)
const byDate = (a: Node, b: Node) => (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0)

const toggleSorting = (variable: Ref<ISortingOptions>) => {
	if (variable.value === 'ascending') {
		variable.value = 'descending'
	} else if (variable.value === 'descending') {
		variable.value = undefined
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
const sortedFiles = computed(() => {
	const s = props.files.sort(
		(a, b) =>
			ordering[sortByName.value || 'none'](a, b, byName) ||
			ordering[sortBySize.value || 'none'](a, b, bySize) ||
			ordering[sortByModified.value || 'none'](a, b, byDate)
	)
	console.warn('files sorted')
	return s
}
)

/**
 * Contains the selectable files, filtering out directories if `allowPickDirectory` is not set
 */
const selectableFiles = computed(() => props.files.filter((file) => props.allowPickDirectory || file.mime !== 'https/unix-directory'))

/**
 * Whether all selectable files are currently selected
 */
const allSelected = computed(() => !props.loading && props.selectedFiles.length >= selectableFiles.value.length)

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

function onNodeSelected(file: Node){
	if (props.selectedFiles.includes(file)) {
		emit('update:selectedFiles', props.selectedFiles.filter((f) => f.path !== file.path))
	} else {
		emit('update:selectedFiles', [...props.selectedFiles, file])
	}
}

function onChangeDirectory(dir: Node) {
	emit('update:path', join(props.path, dir.basename))
}
</script>

<style scoped lang="scss">
.file-picker {
	&__files {
		// ensure focus outlines are visible
		padding: 2px;
		padding-inline-start: 12px; // align with bread crumbs
		min-height: calc(5 * var(--row-height, 50px)); // make file list not jumping when loading (1x header 4x loading placeholders)
		overflow: scroll auto;

		table {
			width: 100%;
			max-height: 100%;
			table-layout: fixed;
		}
		th {
			position: sticky;
			top: 0;
			background-color: var(--color-main-background);
			// ensure focus outline of buttons is visible
			padding: 2px;

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
