/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { ContentsWithRoot, Folder, Node } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'
import type { FileStat, ResponseDataDetailed, SearchResult } from 'webdav'

import { davGetClient, davGetDefaultPropfind, davGetRecentSearch, davRemoteURL, davResultToNode, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { generateRemoteUrl } from '@nextcloud/router'
import { isPublicShare } from '@nextcloud/sharing/public'
import { join } from 'node:path'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
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

	const isPublicEndpoint = isPublicShare()

	const defaultRootPath = isPublicEndpoint ? '/' : davRootPath

	const defaultRemoteUrl = computed(() => {
		if (isPublicEndpoint) {
			return generateRemoteUrl('webdav').replace('/remote.php', '/public.php')
		}
		return davRemoteURL
	})

	/**
	 * The WebDAV client
	 */
	const client = computed(() => {
		if (isPublicEndpoint) {
			const token = (document.getElementById('sharingToken')! as HTMLInputElement).value
			const authorization = btoa(`${token}:null`)

			return davGetClient(defaultRemoteUrl.value, {
				Authorization: `Basic ${authorization}`,
			})
		}

		return davGetClient()
	})

	const resultToNode = (result: FileStat) => davResultToNode(result, defaultRootPath, defaultRemoteUrl.value)

	const getRecentNodes = (): CancelablePromise<Node[]> => {
		const controller = new AbortController()
		// unix timestamp in seconds, two weeks ago
		const lastTwoWeek = Math.round(Date.now() / 1000) - (60 * 60 * 24 * 14)
		return new CancelablePromise(async (resolve, reject, onCancel) => {
			onCancel(() => controller.abort())
			try {
				const { data } = await client.value.search('/', {
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
				const results = await client.value.getDirectoryContents(`${defaultRootPath}${currentPath.value}`, {
					signal: controller.signal,
					details: true,
					data: davGetDefaultPropfind(),
				}) as ResponseDataDetailed<FileStat[]>
				let nodes = results.data.map(resultToNode)
				// Hack for the public endpoint which always returns folder itself
				if (isPublicEndpoint) {
					nodes = nodes.filter((file) => file.path !== currentPath.value)
				}
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
	const folder = shallowRef<Folder|null>(null)

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
	 * @param name Name of the new directory
	 * @return The created directory
	 */
	async function createDirectory(name: string): Promise<Folder> {
		const path = join(currentPath.value, name)

		await client.value.createDirectory(join(defaultRootPath, path))
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
	async function getFile(path: string, rootPath: string|undefined = undefined) {
		rootPath = rootPath ?? defaultRootPath

		const { data } = await client.value.stat(`${rootPath}${path}`, {
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
			promise.value = getFavoriteNodes(client.value, currentPath.value, defaultRootPath)
		} else if (currentView.value === 'recent') {
			promise.value = getRecentNodes()
		} else {
			promise.value = getNodes()
		}
		const content = await promise.value
		if ('folder' in content) {
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
