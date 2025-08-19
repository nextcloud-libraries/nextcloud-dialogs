/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { WebDAVClient } from 'webdav'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const nextcloudFiles = vi.hoisted(() => ({
	davResultToNode: vi.fn((v) => v),
	davGetDefaultPropfind: vi.fn(() => 'propfind content'),
	davRootPath: '/root/path',
}))
vi.mock('@nextcloud/files', () => nextcloudFiles)

describe('DAV utils', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('getFile works', async () => {
		const client = {
			stat: vi.fn((v) => Promise.resolve({ data: { path: v } })),
			getDirectoryContents: vi.fn(() => ({ data: [] })),
		} as unknown as WebDAVClient

		const { getFile } = await import('./dav.ts')

		const node = await getFile(client, '/some/path/file.ext')
		expect(node).toEqual({ path: `${nextcloudFiles.davRootPath}/some/path/file.ext` })
		// Check mock usage
		expect(client.stat).toBeCalledWith(`${nextcloudFiles.davRootPath}/some/path/file.ext`, { details: true, data: 'propfind content' })
		expect(nextcloudFiles.davResultToNode).toBeCalledWith({ path: `${nextcloudFiles.davRootPath}/some/path/file.ext` })
	})
})
