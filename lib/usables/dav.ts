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
import type { Node } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'
import type { FileStat, ResponseDataDetailed, WebDAVClient } from 'webdav'

import { davGetClient, davGetDefaultPropfind, davGetRecentSearch, davResultToNode, davRootPath, getFavoriteNodes } from '@nextcloud/files'
import { onMounted, ref, watch } from 'vue'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
 */
export const useDAVFiles = function(currentView: Ref<'files'|'recent'|'favorites'> | ComputedRef<'files'|'recent'|'favorites'>, currentPath: Ref<string> | ComputedRef<string>): { isLoading: Ref<boolean>, client: WebDAVClient, files: Ref<Node[]>, loadFiles: () => void, getFile: (path: string) => Promise<Node> } {
	/**
	 * The WebDAV client
	 */
	const client = davGetClient()

	/**
	 * All files in current view and path
	 */
	const files = ref<Node[]>([] as Node[]) as Ref<Node[]>

	/**
	 * Loading state of the files
	 */
	const isLoading = ref(true)

	/**
	 * Get information for one file
	 *
	 * @param path The path of the file or folder
	 * @param rootPath DAV root path, defaults to '/files/USERID'
	 */
	async function getFile(path: string, rootPath = davRootPath) {
		const result = await client.stat(`${rootPath}${path}`, {
			details: true,
		}) as ResponseDataDetailed<FileStat>
		return davResultToNode(result.data)
	}

	/**
	 * Force reload files using the DAV client
	 */
	async function loadDAVFiles() {
		isLoading.value = true

		if (currentView.value === 'favorites') {
			files.value = await getFavoriteNodes(client, currentPath.value)
		} else if (currentView.value === 'recent') {
			// unix timestamp in seconds, two weeks ago
			const lastTwoWeek = Math.round(Date.now() / 1000) - (60 * 60 * 24 * 14)
			const results = await client.getDirectoryContents(currentPath.value, {
				details: true,
				data: davGetRecentSearch(lastTwoWeek),
				headers: {
					method: 'SEARCH',
					'Content-Type': 'application/xml; charset=utf-8',
				},
				deep: true,
			}) as ResponseDataDetailed<FileStat[]>

			files.value = results.data.map((r) => davResultToNode(r))
		} else {
			const results = await client.getDirectoryContents(`${davRootPath}${currentPath.value}`, {
				details: true,
				data: davGetDefaultPropfind(),
			}) as ResponseDataDetailed<FileStat[]>
			files.value = results.data.map((r) => davResultToNode(r))
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
		loadFiles: () => loadDAVFiles(),
		getFile,
		client,
	}
}
