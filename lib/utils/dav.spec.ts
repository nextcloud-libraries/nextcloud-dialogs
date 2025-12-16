/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { WebDAVClient } from 'webdav'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const nextcloudFiles = vi.hoisted(() => ({
	resultToNode: vi.fn((v) => v),
	getDefaultPropfind: vi.fn(() => 'propfind content'),
	defaultRootPath: '/root/path',
}))
vi.mock('@nextcloud/files/dav', () => nextcloudFiles)

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
		expect(node).toEqual({ path: `${nextcloudFiles.defaultRootPath}/some/path/file.ext` })
		// Check mock usage
		expect(client.stat).toBeCalledWith(`${nextcloudFiles.defaultRootPath}/some/path/file.ext`, { details: true, data: 'propfind content' })
		expect(nextcloudFiles.resultToNode).toBeCalledWith({ path: `${nextcloudFiles.defaultRootPath}/some/path/file.ext` })
	})
})
