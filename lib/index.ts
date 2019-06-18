/// <reference types="nextcloud-typings" />

type OC16to17 = Nextcloud.v16.OC | Nextcloud.v17.OC
declare var OC: OC16to17;
declare var humanFileSize: Nextcloud.v16.humanFileSize | Nextcloud.v17.humanFileSize;

export enum FilePickerType {
    Choose = 1,
    Move = 2,
    Copy = 3,
    CopyMove = 4,
}

export function pickFileOrDirectory(
    title: string,
    multiselect: boolean = false,
    mimeTypeFilter: Array<string> = [],
    modal: boolean = false,
    type: FilePickerType = FilePickerType.Choose
): Promise<string> {
    return new Promise((res, rej) => {
        OC.dialogs.filepicker(
            title,
            res,
            multiselect,
            mimeTypeFilter,
            modal,
            type
        )
    })
}

/**
 * Returns a human readable file size
 *
 * @param {Number} size Size in bytes
 * @param {Boolean} skipSmallSizes return '< 1 kB' for small files
 * @return {String}
 * @since 15.0.0
 */
export function formatFileSize(size: Number, skipSmallSize: boolean): String {
    return humanFileSize(size, skipSmallSize)
}