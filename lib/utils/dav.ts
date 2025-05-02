/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ContentsWithRoot, Folder, Node } from '@nextcloud/files'
import type { FileStat, ResponseDataDetailed, SearchResult, WebDAVClient } from 'webdav'

import { davGetDefaultPropfind, davGetRecentSearch, davResultToNode, davRootPath } from '@nextcloud/files'
import { joinPaths as join } from '@nextcloud/paths'
import { CancelablePromise } from 'cancelable-promise'

/**
 * Get the recently changed nodes from the last two weeks
 *
 * @param client - The WebDAV client
 */
export function getRecentNodes(client: WebDAVClient): CancelablePromise<Node[]> {
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
			const nodes = data.results.map((result: FileStat) => davResultToNode(result))
			resolve(nodes)
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Get the directory content
 *
 * @param client - The WebDAV client
 * @param directoryPath - The path to fetch
 */
export function getNodes(client: WebDAVClient, directoryPath: string): CancelablePromise<ContentsWithRoot> {
	const controller = new AbortController()
	return new CancelablePromise(async (resolve, reject, onCancel) => {
		onCancel(() => controller.abort())
		try {
			const results = await client.getDirectoryContents(join(davRootPath, directoryPath), {
				signal: controller.signal,
				details: true,
				includeSelf: true,
				data: davGetDefaultPropfind(),
			}) as ResponseDataDetailed<FileStat[]>
			const nodes = results.data.map((result: FileStat) => davResultToNode(result))
			resolve({
				contents: nodes.filter(({ path }) => path !== directoryPath),
				folder: nodes.find(({ path }) => path === directoryPath) as Folder,
			})
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Get information for one file
 *
 * @param client The WebDAV client
 * @param path The path of the file or folder
 */
export async function getFile(client: WebDAVClient, path: string) {
	const { data } = await client.stat(join(davRootPath, path), {
		details: true,
		data: davGetDefaultPropfind(),
	}) as ResponseDataDetailed<FileStat>
	return davResultToNode(data)
}
