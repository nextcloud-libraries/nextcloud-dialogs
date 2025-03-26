/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AsyncComponent } from 'vue'
import type { DefaultComputed, DefaultData, DefaultMethods } from 'vue/types/options.d.ts'
import { defineAsyncComponent } from 'vue'

type IFilePickerProps = (typeof import ('./FilePicker.vue').default)['props']

// Async import for module splitting (treeshaking)
/**
 * FilePicker Vue component (implemented as async component)
 * @example
 * ```vue
 * <template>
 *   <FilePicker name="Select a file" :buttons="buttons" />
 * </template>
 * <script setup lang="ts">
 *   import { FilePickerVue as FilePicker, type IFilePickerButton } from '@nextcloud/dialogs'
 *   const buttons: IFilePickerButton[] = [{
 *     label: 'Pick',
 *     callback: (nodes) => console.log('Picked', nodes)
 *   }]
 * </script>
 */
export const FilePickerVue = defineAsyncComponent(() => import('./FilePicker.vue')) as AsyncComponent<DefaultData<never>, DefaultMethods<never>, DefaultComputed, IFilePickerProps>
