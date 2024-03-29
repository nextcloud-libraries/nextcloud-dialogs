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
import { Folder, Permission, type Node } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'
import type { FileStat, ResponseDataDetailed, SearchResult } from 'webdav'

import { davGetClient, davGetDefaultPropfind, davGetRecentSearch, davRemoteURL, davResultToNode, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { generateRemoteUrl } from '@nextcloud/router'
import { join } from 'path'
import { computed, onMounted, ref, watch } from 'vue'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
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

	/**
	 * All files in current view and path
	 */
	const files = ref<Node[]>([] as Node[]) as Ref<Node[]>

	/**
	 * Loading state of the files
	 */
	const isLoading = ref(true)

	/**
	 * Create a new directory in the current path
	 * @param name Name of the new directory
	 * @return The created directory
	 */
	async function createDirectory(name: string): Promise<Folder> {
		const path = join(currentPath.value, name)

		const { headers } = await client.value.customRequest(
			join(defaultRootPath.value, path),
			{
				method: 'MKCOL',
			},
		)
		const stat = await getFile(path)
		const directory = new Folder({
			id: parseInt(headers.get('oc-fileid') ?? '0'),
			source: stat.source,
			mtime: stat.mtime,
			crtime: stat.mtime,
			mime: stat.mime,
			size: stat.size,
			permissions: Permission.ALL,
			owner: stat.owner,
			attributes: stat.attributes,
			root: stat.root ? stat.root : undefined,
			status: stat.status,
		})
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
		}) as ResponseDataDetailed<FileStat>
		return resultToNode(data)
	}

	/**
	 * Force reload files using the DAV client
	 */
	async function loadDAVFiles() {
		isLoading.value = true

		if (currentView.value === 'favorites') {
			files.value = await getFavoriteNodes(client.value, currentPath.value, defaultRootPath.value)
		} else if (currentView.value === 'recent') {
			// unix timestamp in seconds, two weeks ago
			const lastTwoWeek = Math.round(Date.now() / 1000) - (60 * 60 * 24 * 14)
			const { data } = await client.value.search('/', {
				details: true,
				data: davGetRecentSearch(lastTwoWeek),
			}) as ResponseDataDetailed<SearchResult>
			files.value = data.results.map(resultToNode)
		} else {
			const results = await client.value.getDirectoryContents(`${defaultRootPath.value}${currentPath.value}`, {
				details: true,
				data: davGetDefaultPropfind(),
			}) as ResponseDataDetailed<FileStat[]>
			files.value = results.data.map(resultToNode)

			// Hack for the public endpoint which always returns folder itself
			if (isPublicEndpoint.value) {
				files.value = files.value.filter((file) => file.path !== currentPath.value)
			}
		}

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
