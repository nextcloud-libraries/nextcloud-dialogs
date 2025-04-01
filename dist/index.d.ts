import { App } from 'vue';
import { Component } from 'vue';
import { default as default_2 } from 'toastify-js';
import { Node as Node_2 } from '@nextcloud/files';

/**
 * This class provides generic Nextcloud themed dialogs
 */
export declare class Dialog {
    #private;
    constructor(name: string, text: string, buttons?: IDialogButton[], severity?: DialogSeverity);
    /**
     * @deprecated DO NOT USE! It will be removed in the near future!
     * @param html HTML content
     */
    setHTML(html: string): this;
    /**
     * Spawn and show the dialog - if already open the previous instance will be destroyed
     * @return Promise that resolves when the dialog is answered successfully and rejects on close
     */
    show(): Promise<unknown>;
    /**
     * Hide and destroy the current dialog instance
     */
    hide(): void;
}

/**
 * The DialogBuilder provides an easy to use interface for creating simple dialogs in consistent Nextcloud design
 *
 * @example
 * ```ts
 * // It is recommended to use `getDialogBuilder` instead
 * const dialogBuilder = new DialogBuilder('The dialog title')
 * const dialog = dialogBuilder
 *     .setText('The dialog message')
 *     .setSeverity(DialogSeverity.Warning)
 *     .addButton({
 *         label: 'Ok',
 *         callback: () => console.warn('Warning was dismissed'),
 *     })
 *     .build()
 * ```
 */
export declare class DialogBuilder {
    #private;
    constructor(name?: string);
    /**
     * Set dialog name
     * @param name The name or headline of the dialog
     */
    setName(name: string): this;
    /**
     * Set the dialog text
     * @param text Main text of the dialog
     */
    setText(text: string): this;
    /**
     * Set the severity of the dialog
     * @param severity Severity of the dialog
     */
    setSeverity(severity: DialogSeverity): this;
    /**
     * Set buttons from array
     * @param buttons Either an array of dialog buttons
     */
    setButtons(buttons: IDialogButton[]): this;
    /**
     * Add a single button
     * @param button Button to add
     */
    addButton(button: IDialogButton): this;
    build(): Dialog;
}

export declare enum DialogSeverity {
    Info = "info",
    Warning = "warning",
    Error = "error"
}

export declare class FilePicker<IsMultiSelect extends boolean> {
    private title;
    private multiSelect;
    private mimeTypeFilter;
    private directoriesAllowed;
    private buttons;
    private path?;
    private filter?;
    private container?;
    private disabledNavigation;
    constructor(title: string, multiSelect: IsMultiSelect, mimeTypeFilter: string[], directoriesAllowed: boolean, buttons: IFilePickerButton[] | IFilePickerButtonFactory, path?: string, filter?: IFilePickerFilter, container?: string, disabledNavigation?: boolean);
    /**
     * Pick files using the FilePicker
     *
     * @return Promise with array of picked files or rejected promise on close without picking
     */
    pick(): Promise<IsMultiSelect extends true ? string[] : string>;
}

export declare class FilePickerBuilder<IsMultiSelect extends boolean> {
    private title;
    private multiSelect;
    private mimeTypeFilter;
    private directoriesAllowed;
    private path?;
    private filter?;
    private buttons;
    private container?;
    private disabledNavigation;
    /**
     * Construct a new FilePicker
     *
     * @param title Title of the FilePicker
     */
    constructor(title: string);
    /**
     * Set the container where the FilePicker will be mounted
     * By default 'body' is used
     *
     * @param container The dialog container
     */
    setContainer(container: string): this;
    /**
     * Enable or disable picking multiple files
     *
     * @param ms True to enable picking multiple files, false otherwise
     */
    setMultiSelect<T extends boolean>(ms: T): FilePickerBuilder<T extends true ? true : false>;
    /**
     * Add allowed MIME type
     *
     * @param filter MIME type to allow
     */
    addMimeTypeFilter(filter: string): this;
    /**
     * Set allowed MIME types
     *
     * @param filter Array of allowed MIME types
     */
    setMimeTypeFilter(filter: string[]): this;
    /**
     * Add a button to the FilePicker
     * Note: This overrides any previous `setButtonFactory` call
     *
     * @param button The button
     */
    addButton(button: IFilePickerButton): this;
    /**
     * Set the button factory which is used to generate buttons from current view, path and selected nodes
     * Note: This overrides any previous `addButton` call
     *
     * @param factory The button factory
     */
    setButtonFactory(factory: IFilePickerButtonFactory): this;
    /**
     * Set FilePicker type based on legacy file picker types
     * @param type The legacy filepicker type to emulate
     * @deprecated Use `addButton` or `setButtonFactory` instead as with setType you do not know which button was pressed
     */
    setType(type: FilePickerType): this;
    /**
     * Allow to pick directories besides files
     *
     * @param allow True to allow picking directories
     */
    allowDirectories(allow?: boolean): this;
    /**
     * Set starting path of the FilePicker
     *
     * @param path Path to start from picking
     */
    startAt(path: string): this;
    /**
     * Add filter function to filter file list of FilePicker
     *
     * @param filter Filter function to apply
     */
    setFilter(filter: IFilePickerFilter): this;
    /**
     * Allow to pick directories besides files
     *
     * @param allow True to allow picking directories
     */
    disableNavigation(): this;
    /**
     * Construct the configured FilePicker
     */
    build(): FilePicker<IsMultiSelect>;
}

/**
 * Error that is thrown in the rejected promise when the FilePicker was closed
 */
export declare class FilePickerClosed extends Error {
}

/**
 * @deprecated
 */
export declare enum FilePickerType {
    Choose = 1,
    Move = 2,
    Copy = 3,
    CopyMove = 4,
    Custom = 5
}

/**
 * Get the dialog builder to create a new dialog
 *
 * @param name The name of the dialog (title)
 * @example
 * ```ts
 * const dialog = getDialogBuilder('Confirm action')
 *     .addButton({
 *         label: 'Ok',
 *         callback: () => console.warn('confirmed'),
 *     })
 *     .build()
 * ```
 */
export declare function getDialogBuilder(name: string): DialogBuilder;

/**
 *
 * @param title Title of the file picker
 */
export declare function getFilePickerBuilder(title: string): FilePickerBuilder<boolean>;

/**
 * Interface for defining buttons passed to the Dialog component
 * See NcDialogButton
 */
export declare interface IDialogButton {
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

declare type IFilePickerButtonFactory = (selectedNodes: Node_2[], currentPath: string, currentView: string) => IFilePickerButton[];

/**
 * Type of filter functions to filter the FilePicker's file list
 */
export declare type IFilePickerFilter = (node: Node_2) => boolean;

/**
 * Show a toast message with error styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showError(text: string, options?: ToastOptions): Toast;

/**
 * Show a toast message with info styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showInfo(text: string, options?: ToastOptions): Toast;

/**
 * Show a toast message with a loading spinner
 * The toast will be shown permanently and needs to be hidden manually by calling hideToast()
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showLoading(text: string, options?: ToastOptions): Toast;

/**
 * Show a toast message
 *
 * @param data Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showMessage(data: string | Node, options?: ToastOptions): Toast;

/**
 * Show a toast message with success styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showSuccess(text: string, options?: ToastOptions): Toast;

/**
 * Show a toast message with undo styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param onUndo Function that is called when the undo button is clicked
 * @param options
 */
export declare function showUndo(text: string, onUndo: (e: MouseEvent) => void, options?: ToastOptions): Toast;

/**
 * Show a toast message with warning styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export declare function showWarning(text: string, options?: ToastOptions): Toast;

/**
 * Helper to spawn a Vue dialog without having to mount it from a component
 *
 * @param dialog The dialog component to spawn
 * @param props Properties to pass to the dialog
 * @param onClose Callback when the dialog is closed
 */
export declare const spawnDialog: (dialog: Component, props: any, onClose?: (...rest: unknown[]) => void) => App;

/**
 * Type of a toast
 * @see https://apvarun.github.io/toastify-js/
 * @notExported
 */
declare type Toast = ReturnType<typeof default_2>;

/** @deprecated Use ToastAriaLive.ASSERTIVE */
export declare const TOAST_ARIA_LIVE_ASSERTIVE = "assertive";

/** @deprecated Use ToastAriaLive.OFF */
export declare const TOAST_ARIA_LIVE_OFF = "off";

/** @deprecated Use ToastAriaLive.POLITE */
export declare const TOAST_ARIA_LIVE_POLITE = "polite";

/** Default timeout in ms of toasts */
export declare const TOAST_DEFAULT_TIMEOUT = 7000;

/** Timeout value to show a toast permanently */
export declare const TOAST_PERMANENT_TIMEOUT = -1;

/** Timeout in ms of a undo toast */
export declare const TOAST_UNDO_TIMEOUT = 10000;

export declare enum ToastAriaLive {
    OFF = "off",
    POLITE = "polite",
    ASSERTIVE = "assertive"
}

export declare interface ToastOptions {
    /**
     * Defines the timeout in milliseconds after which the toast is closed. Set to -1 to have a persistent toast.
     */
    timeout?: number;
    /**
     * Set to true to allow HTML content inside of the toast text
     * @default false
     */
    isHTML?: boolean;
    /**
     * Set a type of {ToastType} to style the modal
     */
    type?: ToastType;
    /**
     * Provide a function that is called after the toast is removed
     */
    onRemove?: () => void;
    /**
     * Provide a function that is called when the toast is clicked
     */
    onClick?: () => void;
    /**
     * Make the toast closable
     */
    close?: boolean;
    /**
     * Specify the element to attach the toast element to (for testing)
     */
    selector?: string;
    /**
     * Whether the messages should be announced to screen readers.
     * See the following docs for an explanation when to use which:
     * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
     *
     * By default, errors are announced assertive and other messages "polite".
     */
    ariaLive?: ToastAriaLive;
}

/**
 * Enum of available Toast types
 */
export declare enum ToastType {
    ERROR = "toast-error",
    WARNING = "toast-warning",
    INFO = "toast-info",
    SUCCESS = "toast-success",
    PERMANENT = "toast-error",
    UNDO = "toast-undo",
    LOADING = "toast-loading"
}

export { }
