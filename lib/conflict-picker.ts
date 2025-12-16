/*!
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { INode } from '@nextcloud/files'

import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import { defineAsyncComponent } from 'vue'

export type ConflictInput = File | FileSystemEntry | INode

export interface ConflictResolutionResult<T extends ConflictInput> {
	/**
	 * The selected incoming nodes.
	 * Meaning this selected incoming nodes should overwrite the existing nodes.
	 */
	selected: T[]

	/**
	 * The incoming nodes which should be renamed.
	 * Meaning those nodes still should be uploaded but with a new unique name to not override existing nodes.
	 */
	renamed: T[]

	/**
	 * The nodes not selected for upload.
	 * Meaning those incoming nodes should be skipped from the action and not be used.
	 */
	skipped: T[]
}

export interface ConflictPickerOptions {
	/**
	 * The container for the conflict picker dialog.
	 * Defaults to the `<body>`.
	 */
	container?: string
	/**
	 * When this is set to true a hint is shown that conflicts in directories are handles recursively
	 * You still need to call this function for each directory separately.
	 */
	recursive?: boolean
}

/**
 * Open the conflict resolver for uploading nodes.
 * Given the current content of the directory and the conflicting new nodes,
 * this will ask the user for resolving the conflicts and return the conflict resolution.
 *
 * @param dirname - The directory name with conflicts (used for the dialog title)
 * @param conflicts - The incoming nodes
 * @param content - The current content of the directory (existing nodes)
 * @param options Optional settings for the conflict picker
 *
 * @return The conflict resolution or null if the user aborted.
 */
export async function openConflictPicker<T extends ConflictInput>(
	dirname: string | undefined,
	conflicts: T[],
	content: INode[],
	options?: ConflictPickerOptions,
): Promise<ConflictResolutionResult<T> | null> {
	const ConflictPicker = defineAsyncComponent(() => import('./components/ConflictPicker/ConflictPicker.vue'))

	const incoming: T[] = []
	const existing: INode[] = []
	for (const node of content) {
		if (isConflictingNode(node)) {
			existing.push(node)
			incoming.push(conflicts[indexOf(node)]!)
		}
	}

	if (conflicts.length === 0 || content.length === 0) {
		throw new Error('ConflictPicker: files and conflicts must not be empty')
	}

	if (conflicts.length !== content.length) {
		throw new Error('ConflictPicker: files and conflicts must have the same length. Make sure you filter out non conflicting files from the conflicts array.')
	}

	return await spawnDialog(ConflictPicker, {
		dirname,
		existing,
		incoming,
		recursiveUpload: options?.recursive === true,
	}, {
		container: options?.container,
	}) as (ConflictResolutionResult<T> | null)

	/**
	 * Check whether a given node from the `content` is part of the `conflicts`.
	 *
	 * @param node - The node to check
	 */
	function isConflictingNode(node: INode) {
		return conflicts.some((entry) => nodeIsConflict(node, entry))
	}

	/**
	 * Get the index of this node in the conflicts
	 *
	 * @param node - The node to check
	 */
	function indexOf(node: INode): number {
		return conflicts.findIndex((entry) => nodeIsConflict(node, entry))
	}

	/**
	 * Check if the given node is the reason for the conflict
	 *
	 * @param node - The node to check
	 * @param conflict - The conflict to check
	 */
	function nodeIsConflict(node: INode, conflict: ConflictInput): boolean {
		if ('basename' in conflict) {
			return conflict.basename === node.basename
		}
		return conflict.name === node.basename
	}
}
