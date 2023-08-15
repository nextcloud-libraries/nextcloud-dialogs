/// <reference types="@nextcloud/typings" />

declare const OC: Nextcloud.v25.OC | Nextcloud.v26.OC | Nextcloud.v27.OC

export enum FilePickerType {
	Choose = 1,
	Move = 2,
	Copy = 3,
	CopyMove = 4,
	Custom = 5,
}

export interface FilePickerButton {
	text: string
	type?: 'primary' | 'secondary'
	/** Passed on the callback as second argument */
	id: number
}

export class FilePicker {

	private title: string
	private multiSelect: boolean
	private mimeTypeFiler: string[]
	private modal: boolean
	private type: FilePickerType
	private directoriesAllowed: boolean
	private buttons?: FilePickerButton[]
	private path?: string
	private filter?: Nextcloud.v24.FilePickerFilter

	public constructor(title: string,
		multiSelect: boolean,
		mimeTypeFilter: string[],
		modal: boolean,
		type: FilePickerType,
		directoriesAllowed: boolean,
		path?: string,
		filter?: Nextcloud.v24.FilePickerFilter,
		buttons?: FilePickerButton[]) {
		this.title = title
		this.multiSelect = multiSelect
		this.mimeTypeFiler = mimeTypeFilter
		this.modal = modal
		this.type = type
		this.directoriesAllowed = directoriesAllowed
		this.path = path
		this.filter = filter
		this.buttons = buttons
	}

	public pick(): Promise<string|string[]> {
		return new Promise((resolve) => {
			const buttons = this.buttons?.map(button => ({
				defaultButton: button.type === 'primary',
				label: button.text,
				type: button.id,
			}))

			OC.dialogs.filepicker(
				this.title,
				resolve,
				this.multiSelect,
				this.mimeTypeFiler,
				this.modal,
				this.type,
				this.path,
				{
					allowDirectoryChooser: this.directoriesAllowed,
					filter: this.filter,
					buttons,
				},
			)
		})
	}

}

export class FilePickerBuilder {

	private title: string
	private multiSelect = false
	private mimeTypeFiler: string[] = []
	private modal = true
	private type: FilePickerType = FilePickerType.Choose
	private directoriesAllowed = false
	private path?: string
	private filter?: Nextcloud.v24.FilePickerFilter
	private buttons: FilePickerButton[] = []

	public constructor(title: string) {
		this.title = title
	}

	public setMultiSelect(ms: boolean): FilePickerBuilder {
		this.multiSelect = ms
		return this
	}

	public addMimeTypeFilter(filter: string): FilePickerBuilder {
		this.mimeTypeFiler.push(filter)
		return this
	}

	public setMimeTypeFilter(filter: string[]): FilePickerBuilder {
		this.mimeTypeFiler = filter
		return this
	}

	public addButton(button: FilePickerButton): FilePickerBuilder {
		this.buttons.push(button)
		return this
	}

	/**
	 * @param modal no function
	 * @deprecated Does not have any effect as the dialog is always modal
	 */
	public setModal(modal: boolean): FilePickerBuilder {
		this.modal = modal
		return this
	}

	public setType(type: FilePickerType): FilePickerBuilder {
		this.type = type
		return this
	}

	public allowDirectories(allow = true): FilePickerBuilder {
		this.directoriesAllowed = allow
		return this
	}

	public startAt(path: string): FilePickerBuilder {
		this.path = path
		return this
	}

	public setFilter(filter: Nextcloud.v24.FilePickerFilter): FilePickerBuilder {
		this.filter = filter
		return this
	}

	public build(): FilePicker {
		if (this.buttons && this.type !== FilePickerType.Custom) {
			console.error('FilePickerBuilder: When adding custom buttons the `type` must be set to `FilePickerType.Custom`.')
		}

		return new FilePicker(
			this.title,
			this.multiSelect,
			this.mimeTypeFiler,
			this.modal,
			this.type,
			this.directoriesAllowed,
			this.path,
			this.filter,
			this.buttons,
		)
	}

}

/**
 *
 * @param title Title of the file picker
 */
export function getFilePickerBuilder(title: string): FilePickerBuilder {
	return new FilePickerBuilder(title)
}
