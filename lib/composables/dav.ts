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
 *
 */
import type { Folder, Node } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'
import type { FileStat, ResponseDataDetailed, SearchResult } from 'webdav'

import { davGetClient, davGetDefaultPropfind, davGetRecentSearch, davRemoteURL, davResultToNode, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { generateRemoteUrl } from '@nextcloud/router'
import { join } from 'path'
import { computed, onMounted, ref, watch } from 'vue'
import { CancelablePromise } from 'cancelable-promise'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
 * @param isPublicEndpoint True if the public `public.php` WebDAV endpoint should be used instead of `remote.php`
 */
export const useDAVFiles = function(
	currentView: Ref<'files'|'recent'|'favorites'> | ComputedRef<'files'|'recent'|'favorites'>,
	currentPath: Ref<string> | ComputedRef<string>,
	isPublicEndpoint: Ref<boolean> | ComputedRef<boolean>
): { isLoading: Ref<boolean>, createDirectory: (name: string) => Promise<Folder>, files: Ref<Node[]>, loadFiles: () => Promise<void>, getFile: (path: string) => Promise<Node> } {

	const defaultRootPath = computed(() => isPublicEndpoint.value ? '/' : davRootPath)

	const defaultRemoteUrl = computed(() => {
		if (isPublicEndpoint.value) {
			return generateRemoteUrl('webdav').replace('/remote.php', '/public.php')
		}
		return davRemoteURL
	})

	/**
	 * The WebDAV client
	 */
	const client = computed(() => {
		if (isPublicEndpoint.value) {
			const token = (document.getElementById('sharingToken')! as HTMLInputElement).value
			const authorization = btoa(`${token}:null`)

			return davGetClient(defaultRemoteUrl.value, {
				Authorization: `Basic ${authorization}`,
			})
		}

		return davGetClient()
	})

	const resultToNode = (result: FileStat) => davResultToNode(result, defaultRootPath.value, defaultRemoteUrl.value)

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
				const results = await client.value.getDirectoryContents(`${defaultRootPath.value}${currentPath.value}`, {
					signal: controller.signal,
					details: true,
					data: davGetDefaultPropfind(),
				}) as ResponseDataDetailed<FileStat[]>
				let nodes = results.data.map(resultToNode)
				// Hack for the public endpoint which always returns folder itself
				if (isPublicEndpoint.value) {
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
	const files = ref<Node[]>([] as Node[]) as Ref<Node[]>

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
	 * @return The created directory
	 */
	async function createDirectory(name: string): Promise<Folder> {
		const path = join(currentPath.value, name)

		await client.value.createDirectory(join(defaultRootPath.value, path))
		const directory = await getFile(path) as Folder
		files.value.push(directory)
		return directory
	}

	/**
	 * Get information for one file
	 *
	 * @param path The path of the file or folder
	 * @param rootPath DAV root path, defaults to '/files/USERID'
	 */
	async function getFile(path: string, rootPath: string|undefined = undefined) {
		rootPath = rootPath ?? defaultRootPath.value

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
			promise.value = getFavoriteNodes(client.value, currentPath.value, defaultRootPath.value)
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
		loadFiles: loadDAVFiles,
		getFile,
		createDirectory,
	}
}
