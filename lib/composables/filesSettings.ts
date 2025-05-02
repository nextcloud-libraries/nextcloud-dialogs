/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ComputedRef, Ref } from 'vue'

import axios from '@nextcloud/axios'
import { loadState } from '@nextcloud/initial-state'
import { generateUrl } from '@nextcloud/router'
import { isPublicShare } from '@nextcloud/sharing/public'
import { toValue } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { showError } from '../toast.ts'
import { t } from '../utils/l10n.ts'

interface OCAFilesUserConfig {
	show_hidden: boolean
	crop_image_previews: boolean
	sort_favorites_first: boolean
}

interface OCAFilesView {
	sorting_direction: 'asc' | 'desc'
	sorting_mode: 'basename' | 'size' | 'mtime'
}

interface OCAFilesViewConfig {
	[view: string]: OCAFilesView
}

interface ViewConfig {
	sortBy: 'basename' | 'size' | 'mtime'
	order: 'ascending' | 'descending' | 'none'
}

export type FileListViews = 'files' | 'recent' | 'favorites'

/**
 * Composable to get the files app settings
 * (show hidden files, sort favorites, crop previews)
 */
export const useFilesSettings = () => {
	const filesUserState = loadState<OCAFilesUserConfig | null>('files', 'config', null)

	const showHiddenFiles = ref(filesUserState?.show_hidden ?? true)
	const sortFavoritesFirst = ref(filesUserState?.sort_favorites_first ?? true)
	const cropImagePreviews = ref(filesUserState?.crop_image_previews ?? true)

	onMounted(async () => {
		if (!isPublicShare()) {
			try {
				const { data } = await axios.get(generateUrl('/apps/files/api/v1/configs'))

				showHiddenFiles.value = data?.data?.show_hidden ?? false
				sortFavoritesFirst.value = data?.data?.sort_favorites_first ?? true
				cropImagePreviews.value = data?.data?.crop_image_previews ?? true
			} catch (error) {
				console.error('Could not load files settings', error)
				showError(t('Could not load files settings'))
			}
		} else {
			console.debug('Skip loading files settings - currently on public share')
		}
	})

	return {
		showHiddenFiles,
		sortFavoritesFirst,
		cropImagePreviews,
	}
}

/**
 * Composable to get the files app view configs for sorting the files list
 *
 * @param currentView the currently active view
 */
export const useFilesViews = (currentView?: FileListViews | Ref<FileListViews> | ComputedRef<FileListViews>) => {
	const convertOrder = (order?: string) => order === 'asc' ? 'ascending' : (order === 'desc' ? 'descending' : 'none')

	const filesViewsState = loadState<OCAFilesViewConfig | null>('files', 'viewConfigs', null)

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

	onMounted(async () => {
		if (!isPublicShare()) {
			try {
				const { data } = await axios.get(generateUrl('/apps/files/api/v1/views'))
				filesViewConfig.value = {
					sortBy: data?.data?.files?.sorting_mode ?? 'basename',
					order: convertOrder(data?.data?.files?.sorting_direction),
				}
				favoritesViewConfig.value = {
					sortBy: data?.data?.favorites?.sorting_mode ?? 'basename',
					order: convertOrder(data?.data?.favorites?.sorting_direction),
				}
				recentViewConfig.value = {
					sortBy: data?.data?.recent?.sorting_mode ?? 'basename',
					order: convertOrder(data?.data?.recent?.sorting_direction),
				}
			} catch (error) {
				console.error('Could not load files views', error)
				showError(t('Could not load files views'))
			}
		} else {
			console.debug('Skip loading files views - currently on public share')
		}
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
