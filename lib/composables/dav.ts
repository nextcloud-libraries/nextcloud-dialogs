/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { Folder, Node } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'
import type { FileStat, ResponseDataDetailed, SearchResult } from 'webdav'

import { davGetClient, davGetDefaultPropfind, davGetRecentSearch, davResultToNode, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { join } from 'path'
import { onMounted, ref, shallowRef, watch } from 'vue'
import { CancelablePromise } from 'cancelable-promise'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
 */
export const useDAVFiles = function(
	currentView: Ref<'files'|'recent'|'favorites'> | ComputedRef<'files'|'recent'|'favorites'>,
	currentPath: Ref<string> | ComputedRef<string>,
) {

	/**
	 * The WebDAV client
	 */
	const client = davGetClient()

	const resultToNode = (result: FileStat) => davResultToNode(result)

	const getRecentNodes = (): CancelablePromise<Node[]> => {
		const controller = new AbortController()
		// unix timestamp in seconds, two weeks ago
		const lastTwoWeek = Math.round(Date.now() / 1000) - (60 * 60 * 24 * 14)
		return new CancelablePromise(async (resolve, reject, onCancel) => {
			onCancel(() => controller.abort())
			try {
				const { data } = await client.search('/', {
					signal: controller.signal,
					details: true,
					data: davGetRecentSearch(lastTwoWeek),
				}) as ResponseDataDetailed<SearchResult>
				const nodes = data.results.map(resultToNode)
				resolve(nodes)
			} catch (error) {
				reject(error)
			}
		})
	}

	const getNodes = (): CancelablePromise<Node[]> => {
		const controller = new AbortController()
		return new CancelablePromise(async (resolve, reject, onCancel) => {
			onCancel(() => controller.abort())
			try {
				const results = await client.getDirectoryContents(join(davRootPath, currentPath.value), {
					signal: controller.signal,
					details: true,
					data: davGetDefaultPropfind(),
				}) as ResponseDataDetailed<FileStat[]>
				let nodes = results.data.map(resultToNode)
				// Hack for the public endpoint which always returns folder itself
				nodes = nodes.filter((file) => file.path !== currentPath.value)
				resolve(nodes)
			} catch (error) {
				reject(error)
			}
		})
	}

	/**
	 * All files in current view and path
	 */
	const files = shallowRef<Node[]>([] as Node[]) as Ref<Node[]>

	/**
	 * The current folder
	 */
	const folder = shallowRef<Folder>()
	watch([currentPath], async () => {
		folder.value = (files.value.find(({ path }) => path === currentPath.value) ?? await getFile(currentPath.value)) as Folder
	}, { immediate: true })

	/**
	 * Loading state of the files
	 */
	const isLoading = ref(true)

	/**
	 * The cancelable promise
	 */
	const promise = ref<null | CancelablePromise<unknown>>(null)

	/**
	 * Create a new directory in the current path
	 * @param name Name of the new directory
	 * @return {Promise<Folder>} The created directory
	 */
	async function createDirectory(name: string): Promise<Folder> {
		const path = join(currentPath.value, name)

		await client.createDirectory(join(davRootPath, path))
		const directory = await getFile(path) as Folder
		files.value = [...files.value, directory]
		return directory
	}

	/**
	 * Get information for one file
	 *
	 * @param path The path of the file or folder
	 * @param rootPath DAV root path, defaults to '/files/USERID'
	 */
	async function getFile(path: string, rootPath: string = davRootPath) {
		const { data } = await client.stat(join(rootPath, path), {
			details: true,
			data: davGetDefaultPropfind(),
		}) as ResponseDataDetailed<FileStat>
		return resultToNode(data)
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
			promise.value = getRecentNodes()
		} else {
			promise.value = getNodes()
		}
		files.value = await promise.value as Node[]

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
		getFile,
		createDirectory,
	}
}
