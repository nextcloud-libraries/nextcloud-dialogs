/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Marker attribute of the visual toast stack rendered by ToastContainer.
 *
 * Individual toasts are mounted as separate Vue apps inside that element
 * (see `_mountToast` in `toast.ts`), so they cannot use provide/inject to talk
 * to the container. They locate the stack through this attribute instead,
 * which also works when the container comes from another bundle of this
 * library sharing the same stack.
 */
export const TOAST_STACK_SELECTOR = '[data-nc-toast-stack]'

/**
 * Event a toast dispatches on the stack when it is dismissed while holding
 * the focus, asking the container to take the focus over before the toast is
 * removed from the DOM – otherwise focus would silently fall back to `<body>`.
 */
export const TOAST_FOCUS_RELEASE_EVENT = 'nc-toast:focus-release'

/**
 * Key that moves the focus into the toast stack.
 *
 * F6 is the conventional "move to the next pane" key of the WAI-ARIA authoring
 * practices, which is what a notification stack outside the normal reading
 * order needs: toasts appear at the very end of the document, so without a
 * shortcut a keyboard user would have to tab through the whole page to reach
 * them before they time out.
 */
export const TOAST_FOCUS_HOTKEY = 'F6'
