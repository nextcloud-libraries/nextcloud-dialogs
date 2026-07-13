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
 * Track which load of a repeatedly started async operation is the current one.
 *
 * The returned closure owns the ONLY state shared between overlapping loads
 * (the abort controller of the most recently started one). A running load
 * never touches that state directly — it only holds its own `AbortSignal`,
 * so a stale invocation cannot accidentally reset shared state that already
 * belongs to a newer load.
 */
function createCurrentLoad() {
	let controller: AbortController | undefined

	/**
	 * Whether the load owning `signal` has been superseded by a newer `start()`.
	 *
	 * Pure query, no side effects — supersession is the only thing that ever
	 * aborts a load's signal, so `signal.aborted` is exactly this fact.
	 *
	 * @param signal The signal this load received from `start()`
	 * @return `true` when a newer `start()` has superseded this load
	 */
	const isSuperseded = (signal: AbortSignal): boolean => signal.aborted

	return {
		/**
		 * Start a new load, aborting a still running previous one.
		 *
		 * @return This load's own abort signal. It is aborted exactly when a
		 *         later `start()` supersedes this load.
		 */
		start(): AbortSignal {
			controller?.abort()
			controller = new AbortController()
			return controller.signal
		},

		isSuperseded,

		/**
		 * Settle the load that owns `signal`.
		 *
		 * While not superseded, `controller` is guaranteed to still be this
		 * load's own (no later `start()` has run), so it can safely be released.
		 *
		 * @param signal The signal this load received from `start()`
		 * @return `true` if this load is still the current one — only then may
		 *         the caller reset shared state. `false` if it was superseded.
		 */
		complete(signal: AbortSignal): boolean {
			if (isSuperseded(signal)) {
				return false
			}
			controller = undefined
			return true
		},
	}
}

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
	 * Coordination of overlapping loads on fast navigation.
	 * All shared state lives inside this closure — `loadDAVFiles` itself only
	 * ever holds the per-invocation signal returned by `currentLoad.start()`.
	 */
	const currentLoad = createCurrentLoad()

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
		// `signal` is this invocation's own — the only way a newer load can
		// interact with this one is by aborting it through currentLoad.start().
		const signal = currentLoad.start()

		isLoading.value = true
		try {
			if (currentView.value === 'favorites') {
				files.value = await getFavoriteNodes({ client, path: currentPath.value, signal })
				folder.value = null
			} else if (currentView.value === 'recent') {
				files.value = await getRecentNodes({ client, signal })
				folder.value = null
			} else {
				const content = await getNodes({ client, path: currentPath.value, signal })
				folder.value = content.folder
				files.value = content.contents
			}
		} catch (error) {
			// A superseded load's outcome is irrelevant:
			// only the live load may report errors.
			if (currentLoad.isSuperseded(signal)) {
				return
			}
			throw error
		} finally {
			// Only the still-current load may settle the shared loading state.
			// A superseded load must never do this — a newer load is still in
			// flight and `folder` may still be null, which would let the
			// FilePicker confirm an empty selection ("No nodes selected").
			if (currentLoad.complete(signal)) {
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
