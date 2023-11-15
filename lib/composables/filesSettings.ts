/**
 * @copyright Copyright (c) 2023 Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { loadState } from '@nextcloud/initial-state'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { toValue } from '@vueuse/core'
import { onMounted } from 'vue'

interface OCAFilesUserConfig {
	show_hidden: boolean
	crop_image_previews: boolean
	sort_favorites_first: boolean
}

interface OCAFilesView {
	sorting_direction: 'asc'|'desc'
	sorting_mode: 'basename'|'size'|'mtime'
}

interface OCAFilesViewConfig {
	[view: string]: OCAFilesView
}

interface ViewConfig {
	sortBy: 'basename'|'size'|'mtime'
	order: 'ascending'|'descending'|'none'
}

export type FileListViews = 'files'|'recent'|'favorites'

/**
 * Composable to get the files app settings
 * (show hidden files, sort favorites, crop previews)
 */
export const useFilesSettings = () => {
	const filesUserState = loadState<OCAFilesUserConfig|null>('files', 'config', null)

	const showHiddenFiles = ref(filesUserState?.show_hidden ?? false)
	const sortFavoritesFirst = ref(filesUserState?.sort_favorites_first ?? true)
	const cropImagePreviews = ref(filesUserState?.crop_image_previews ?? true)

	onMounted(() => {
		axios.get(generateUrl('/apps/files/api/v1/configs')).then((response) => {
			showHiddenFiles.value = response.data?.data?.show_hidden ?? false
			sortFavoritesFirst.value = response.data?.data?.sort_favorites_first ?? true
			cropImagePreviews.value = response.data?.data?.crop_image_previews ?? true
		})
	})

	return {
		showHiddenFiles,
		sortFavoritesFirst,
		cropImagePreviews,
	}
}

/**
 * Composable to get the files app view configs for sorting the files list
 * @param currentView the currently active view
 */
export const useFilesViews = (currentView?: FileListViews|Ref<FileListViews>|ComputedRef<FileListViews>) => {
	const convertOrder = (order?: string) => order === 'asc' ? 'ascending' : (order === 'desc' ? 'descending' : 'none')

	const filesViewsState = loadState<OCAFilesViewConfig|null>('files', 'viewConfigs', null)

	const filesViewConfig = ref<ViewConfig>({
		sortBy: filesViewsState?.files?.sorting_mode ?? 'basename',
		order: convertOrder(filesViewsState?.files?.sorting_direction ?? 'asc'),
	})
	const recentViewConfig = ref<ViewConfig>({
		sortBy: filesViewsState?.recent?.sorting_mode ?? 'basename',
		order: convertOrder(filesViewsState?.recent?.sorting_direction ?? 'asc'),
	})
	const favoritesViewConfig = ref<ViewConfig>({
		sortBy: filesViewsState?.favorites?.sorting_mode ?? 'basename',
		order: convertOrder(filesViewsState?.favorites?.sorting_direction ?? 'asc'),
	})

	onMounted(() => {
		axios.get(generateUrl('/apps/files/api/v1/views')).then((response) => {
			filesViewConfig.value = {
				sortBy: response.data?.data?.files?.sorting_mode ?? 'basename',
				order: convertOrder(response.data?.data?.files?.sorting_direction),
			}
			favoritesViewConfig.value = {
				sortBy: response.data?.data?.favorites?.sorting_mode ?? 'basename',
				order: convertOrder(response.data?.data?.favorites?.sorting_direction),
			}
			recentViewConfig.value = {
				sortBy: response.data?.data?.recent?.sorting_mode ?? 'basename',
				order: convertOrder(response.data?.data?.recent?.sorting_direction),
			}
		})
	})

	const currentConfig = computed(() => toValue(currentView || 'files') === 'files' ? filesViewConfig.value : (toValue(currentView) === 'recent' ? recentViewConfig.value : favoritesViewConfig.value))
	const sortBy = computed(() => currentConfig.value.sortBy)
	const order = computed(() => currentConfig.value.order)

	return {
		filesViewConfig,
		favoritesViewConfig,
		recentViewConfig,
		currentConfig,
		sortBy,
		order,
	}
}
