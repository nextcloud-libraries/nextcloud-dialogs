/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { ContentsWithRoot, Folder, Node } from '@nextcloud/files'
import type { CancelablePromise } from 'cancelable-promise'
import type { ComputedRef, Ref } from 'vue'

import { davGetClient, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { joinPaths as join } from '@nextcloud/paths'
import { onMounted, ref, shallowRef, watch } from 'vue'
import { getFile, getNodes, getRecentNodes } from '../utils/dav.ts'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
 */
export const useDAVFiles = function(
	currentView: Ref<'files' | 'recent' | 'favorites'> | ComputedRef<'files' | 'recent' | 'favorites'>,
	currentPath: Ref<string> | ComputedRef<string>,
) {
	/**
	 * The WebDAV client
	 */
	const client = davGetClient()

	/**
	 * All files in current view and path
	 */
	const files = shallowRef<Node[]>([] as Node[]) as Ref<Node[]>

	/**
	 * The current folder
	 */
	const folder = shallowRef<Folder | null>(null)

	/**
	 * Loading state of the files
	 */
	const isLoading = ref(true)

	/**
	 * The cancelable promise used internally to cancel on fast navigation
	 */
	const promise = ref<null | CancelablePromise<Node[] | ContentsWithRoot>>(null)

	/**
	 * Create a new directory in the current path
	 * The directory will be added to the current file list
	 *
	 * @param name Name of the new directory
	 * @return The created directory
	 */
	async function createDirectory(name: string): Promise<Folder> {
		const path = join(currentPath.value, name)

		await client.createDirectory(join(davRootPath, path))
		const directory = await getFile(client, path) as Folder
		files.value = [...files.value, directory]
		return directory
	}

	/**
	 * Force reload files using the DAV client
	 */
	async function loadDAVFiles() {
		if (promise.value) {
			promise.value.cancel()
		}
		isLoading.value = true

		if (currentView.value === 'favorites') {
			promise.value = getFavoriteNodes(client, currentPath.value)
		} else if (currentView.value === 'recent') {
			promise.value = getRecentNodes(client)
		} else {
			promise.value = getNodes(client, currentPath.value)
		}
		const content = await promise.value
		if (!content) {
			return
		} else if ('folder' in content) {
			folder.value = content.folder
			files.value = content.contents
		} else {
			folder.value = null
			files.value = content
		}

		promise.value = null
		isLoading.value = false
	}

	/**
	 * Watch for ref changes
	 */
	watch([currentView, currentPath], () => loadDAVFiles())

	/**
	 * Initial loading of nodes
	 */
	onMounted(() => loadDAVFiles())

	return {
		isLoading,
		files,
		folder,
		loadFiles: loadDAVFiles,
		createDirectory,
	}
}
