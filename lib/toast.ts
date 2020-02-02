import Toastify from 'toastify-js'

declare interface Toast {
	showToast(): void;
	hideToast(): void;
}

class ToastType {
	static readonly ERROR = 'toast-error';
	static readonly WARNING = 'toast-warning';
	static readonly INFO = 'toast-info';
	static readonly SUCCESS = 'toast-success';
	static readonly PERMANENT = 'toast-error';
}

export interface ToastOptions {
	/**
	 * Defines the timeout after which the toast is closed. Set to 0 to have a persistent toast.
	 */
	timeout: number;
	/**
	 * Set to true to allow HTML content inside of the toast text
	 * @default false
	 */
	isHTML: Boolean;
	/**
	 * Set a type of {ToastType} to style the modal
	 */
	type: ToastType|undefined;
	/**
	 * Provide a function that is called after the toast is shown
	 */
	callback: Function,
	/**
	 * Provide a function that is called when the toast is clicked
	 */
	onClick: Function,
	/**
	 * Make the toast closable
	 */
	close: Boolean;
}

/**
 * Show a toast message
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showMessage(text: string, options: ToastOptions): Toast {
	options = Object.assign({
		timeout: 7,
		isHTML: false,
		type: undefined,
		close: true,
		callback: () => {},
	}, options)
	if (!options.isHTML) {
		// fime mae sure that text is extracted
		const element = document.createElement('div')
		element.innerHTML = text
		text = element.innerText
	}
	let classes = options.type ?? ''


	const toast = Toastify({
		text: text,
		duration: options.timeout ? options.timeout * 1000 : null,
		callback: options.callback,
		onClick: options.onClick,
		close: options.close,
		gravity: 'top',
		selector: 'body-user',
		position: 'right',
		backgroundColor: '',
		className: 'toast ' + classes,
	})
	toast.showToast()
	return toast
}

/**
 * Show a toast message with error styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showError(text: string, options: ToastOptions): Toast {
	options.type = ToastType.ERROR
	return showMessage(text, options)
}

/**
 * Show a toast message with warning styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showWarning(text: string, options: ToastOptions): Toast {
	options.type = ToastType.WARNING
	return showMessage(text, options)
}

/**
 * Show a toast message with info styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showInfo(text: string, options: ToastOptions): Toast {
	options.type = ToastType.INFO
	return showMessage(text, options)
}

/**
 * Show a toast message with success styling
 *
 * @param text Message to be shown in the toast, any HTML is removed by default
 * @param options
 */
export function showSuccess(text: string, options: ToastOptions): Toast {
	options.type = ToastType.SUCCESS
	return showMessage(text, options)
}
