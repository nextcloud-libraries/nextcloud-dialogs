import { Component } from 'vue';
import { default as default_2 } from './FilePicker.vue';
import { DefaultComputed } from 'vue/types/options.js';
import { DefaultData } from 'vue/types/options.js';
import { DefaultMethods } from 'vue/types/options.js';
import { Node as Node_2 } from '@nextcloud/files';

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
export declare const FilePickerVue: Component<DefaultData<never>, DefaultMethods<never>, DefaultComputed, IFilePickerProps>;

/**
 * Interface for defining buttons passed to the Dialog component
 * See NcDialogButton
 */
declare interface IDialogButton {
    /** Label of the button */
    label: string;
    /** Callback on button click */
    callback: () => void;
    /**
     * Optional Icon for the button
     * Should be a SVG image as raw string
     */
    icon?: string;
    /**
     * Button type
     * @see https://nextcloud-vue-components.netlify.app/#/Components/NcButton
     */
    type?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
    /**
     * Disabled state of the button
     * @default false
     */
    disabled?: boolean;
}

/**
 * Interface to define buttons of the FilePicker component
 * The buttons are based on the Dialog buttons but the callback gets the array of selected nodes
 */
export declare interface IFilePickerButton extends Omit<IDialogButton, 'callback'> {
    /**
     * Callback on button click
     *
     * @param nodes Array of `@nextcloud/files` Nodes that were selected
     */
    callback: (nodes: Node_2[]) => void;
}

export declare type IFilePickerButtonFactory = (selectedNodes: Node_2[], currentPath: string, currentView: string) => IFilePickerButton[];

/**
 * Type of filter functions to filter the FilePicker's file list
 */
export declare type IFilePickerFilter = (node: Node_2) => boolean;

declare type IFilePickerProps = (default_2)['props'];

export { }
