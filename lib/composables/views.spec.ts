/**
 * @copyright Copyright (c) 2024 Ferdinand Thiessen <opensource@fthiessen.de>
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
 */

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useViews } from './views'

describe('views composable', () => {
	it('contains all views', () => {
		const { allViews } = useViews(ref(false))
		expect(allViews.length).toBe(3)
		expect(allViews.find(({ id }) => id === 'files')).not.toBe(undefined)
		expect(allViews.find(({ id }) => id === 'recent')).not.toBe(undefined)
		expect(allViews.find(({ id }) => id === 'favorites')).not.toBe(undefined)
	})

	it('has all views on internal route', () => {
		const { availableViews, allViews } = useViews(ref(false))
		expect(allViews.length).toBe(3)
		expect(availableViews.length).toBe(3)
		for(const view of allViews) {
			expect(availableViews.includes(view)).toBe(true)
		}
	})

	it('has only the files views on public route', () => {
		const { availableViews, allViews } = useViews(ref(true))
		expect(allViews.length).toBe(3)
		expect(availableViews.length).toBe(1)
		expect(availableViews[0].id).toBe('files')
	})
})
