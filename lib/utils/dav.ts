/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ContentsWithRoot, Folder, Node } from '@nextcloud/files'
import type { FileStat, ResponseDataDetailed, SearchResult, WebDAVClient } from 'webdav'

import { defaultRootPath, getDefaultPropfind, getRecentSearch, resultToNode } from '@nextcloud/files/dav'
import { join } from '@nextcloud/paths'

/**
 * Get the recently changed nodes from the last two weeks
 *
 * @param context - The context
 * @param context.client - The WebDAV client
 * @param context.signal - The abort signal to cancel the request
 */
export async function getRecentNodes({ client, signal }: { client: WebDAVClient, signal: AbortSignal }): Promise<Node[]> {
	// unix timestamp in seconds, two weeks ago
	const lastTwoWeek = Math.round(Date.now() / 1000) - (60 * 60 * 24 * 14)
	const { data } = await client.search('/', {
		signal,
		details: true,
		data: getRecentSearch(lastTwoWeek),
	}) as ResponseDataDetailed<SearchResult>
	return data.results.map((result: FileStat) => resultToNode(result))
}

/**
 * Get the directory content
 *
 * @param context - The context
 * @param context.client - The WebDAV client
 * @param context.path - The path to fetch
 * @param context.signal - The abort signal to cancel the request
 */
export async function getNodes({ client, path, signal }: { client: WebDAVClient, path: string, signal: AbortSignal }): Promise<ContentsWithRoot> {
	const results = await client.getDirectoryContents(join(defaultRootPath, path), {
		signal,
		details: true,
		includeSelf: true,
		data: getDefaultPropfind(),
	}) as ResponseDataDetailed<FileStat[]>
	const nodes = results.data.map((result: FileStat) => resultToNode(result))
	return {
		contents: nodes.filter(({ path: nodePath }) => nodePath !== path),
		folder: nodes.find(({ path: nodePath }) => path === nodePath) as Folder,
	}
}

/**
 * Get information for one file
 *
 * @param client The WebDAV client
 * @param path The path of the file or folder
 */
export async function getFile(client: WebDAVClient, path: string) {
	const { data } = await client.stat(join(defaultRootPath, path), {
		details: true,
		data: getDefaultPropfind(),
	}) as ResponseDataDetailed<FileStat>
	return resultToNode(data)
}
