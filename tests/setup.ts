/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */

import events from 'node:events'

// Polyfill like the server does
import 'core-js/stable/index.js'

// happy-dom replaces the global `EventTarget`, which Node's `setMaxListeners` rejects.
// But p-queue extends the global `EventTarget` and calls `setMaxListeners` on itself when running in Node.
const { setMaxListeners } = events
events.setMaxListeners = (n, ...eventTargets) => setMaxListeners(n, ...eventTargets.filter((target) => !(target instanceof EventTarget)))
