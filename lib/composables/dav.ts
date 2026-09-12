/*
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IFolder, INode } from '@nextcloud/files'
import type { ComputedRef, Ref } from 'vue'

import { defaultRootPath, getClient, getFavoriteNodes } from '@nextcloud/files/dav'
import { join } from '@nextcloud/paths'
import { onMounted, ref, shallowRef, watch } from 'vue'
import { getFile, getNodes, getRecentNodes } from '../utils/dav.ts'

/**
 * Handle file loading using WebDAV
 *
 * @param currentView Reference to the current files view
 * @param currentPath Reference to the current files path
 */
export function useDAVFiles(
	currentView: Ref<'files' | 'recent' | 'favorites'> | ComputedRef<'files' | 'recent' | 'favorites'>,
	currentPath: Ref<string> | ComputedRef<string>,
) {
	/**
	 * The WebDAV client
	 */
	const client = getClient()

	/**
	 * All files in current view and path
	 */
	const files = shallowRef<INode[]>([] as INode[]) as Ref<INode[]>

	/**
	 * The current folder
	 */
	const folder = shallowRef<IFolder | null>(null)

	/**
	 * Loading state of the files
	 */
	const isLoading = ref(true)

	/**
	 * The cancelable promise used internally to cancel on fast navigation
	 */
	let abortController: AbortController | undefined

	/**
	 * Create a new directory in the current path
	 * The directory will be added to the current file list
	 *
	 * @param name Name of the new directory
	 * @return The created directory
	 */
	async function createDirectory(name: string): Promise<IFolder> {
		const path = join(currentPath.value, name)

		await client.createDirectory(join(defaultRootPath, path))
		const directory = await getFile(client, path) as IFolder
		files.value = [...files.value, directory]
		return directory
	}

	/**
	 * Force reload files using the DAV client
	 */
	async function loadDAVFiles() {
		abortController?.abort()
		const request = new AbortController()
		abortController = request
		isLoading.value = true
		folder.value = null
		files.value = []
		try {
			let nextFiles: INode[]
			let nextFolder: IFolder | null = null
			if (currentView.value === 'favorites') {
				nextFiles = await getFavoriteNodes({ client, path: currentPath.value, signal: request.signal })
			} else if (currentView.value === 'recent') {
				nextFiles = await getRecentNodes({ client, signal: request.signal })
			} else {
				const content = await getNodes({ client, path: currentPath.value, signal: request.signal })
				nextFolder = content.folder
				nextFiles = content.contents
			}
			if (abortController === request) {
				folder.value = nextFolder
				files.value = nextFiles
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				// ignore abort errors
				return
			}
			throw error
		} finally {
			if (abortController === request) {
				abortController = undefined
				isLoading.value = false
			}
		}
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
