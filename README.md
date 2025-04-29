<!--
  - SPDX-FileCopyrightText: 2019-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# @nextcloud/dialogs

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud-libraries/nextcloud-dialogs)](https://api.reuse.software/info/github.com/nextcloud-libraries/nextcloud-dialogs) [![npm](https://img.shields.io/npm/v/@nextcloud/dialogs?style=for-the-badge)](https://www.npmjs.com/package/@nextcloud/dialogs)

Nextcloud dialog helpers

## Installation

```
npm i -S @nextcloud/dialogs
```

### Version compatibility
Since version 4.2 this package provides a Vue.js based file picker, so this package depends on `@nextcloud/vue`. So to not introduce style collisions stick with the supported versions:

| `@nextcloud/dialogs` | maintained | `@nextcloud/vue` dependency |   Nextcloud server version |
|----------------------|------------|-----------------------------|----------------------------|
|                 6.x  |         ✅ |                        8.x  | Nextcloud 29 and newer     |
|                 5.x  |         ❌ |                        8.x  | Nextcloud 28, 29, 30       |
|                 4.2+ |         ❌ |                        7.12 | Nextcloud 25, 26, 27, 27.1 |
|                 4.1  |         ❌ |                       *any* |  *any*                     |

## Usage

### General
The styles for the components (Toasts and FilePicker) are provided in the `style.css` file.
So make sure that the  `@nextcloud/dialogs/style.css` file is included in your app to make sure that the toasts or FilePicker have a proper styling applied.

```js
import '@nextcloud/dialogs/style.css'
```

### Toasts

```js
import { showMessage, showInfo, showSuccess, showWarning, showError } from '@nextcloud/dialogs'
import '@nextcloud/dialogs/style.css'
```

If you using `@nextcloud/dialogs >= 4.0` you don't need any svg or scss loader in you projects anymore.

There are different toast styles available, that are exposed in separate functions:

```
showMessage('Message without a specific styling')
showInfo('Information')
showSuccess('Success')
showWarning('Warning')
showError('Error')
```

There are several options that can be passed in as a second parameter, like the timeout of a toast:

```
showError('This is an error shown without a timeout', { timeout: -1 })
```

A full list of available options can be found in the [documentation](https://nextcloud-libraries.github.io/nextcloud-dialogs/).

### FilePicker
There are two ways to spawn a FilePicker provided by the library:

#### Use the FilePickerBuilder
This way you do not need to use Vue, but can programatically spawn a FilePicker.
The FilePickerBuilder is included in the main entry point of this library, so you can use it like this:

```js
import { getFilePickerBuilder } from '@nextcloud/dialogs'
const filepicker = getFilePickerBuilder('Pick plain text files')
    .addMimeTypeFilter('text/plain')
    .addButton({
        label: 'Pick',
        callback: (nodes) => console.log('Picked', nodes),
    })
    .build()

// You get the file nodes by the button callback, but also the pick yields the paths of the picked files
const paths = await filepicker.pick()
```

#### Use the Vue component directly

> [!WARNING]  
> The Vue component is deprecated and will no longer be exported in a future version.

We also provide the `@nextcloud/dialogs/filepicker.js` entry point to allow using the Vue component directly:

```vue
<template>
  <FilePicker name="Pick some files" :buttons="buttons" />
</template>
<script setup lang="ts">
  import {
    FilePickerVue as FilePicker,
    type IFilePickerButton,
  } from '@nextcloud/dialogs/filepicker.js'
  import type { Node } from '@nextcloud/files'
  import IconShare from 'vue-material-design-icons/Share.vue'

  const buttons: IFilePickerButton[] = [
    {
      label: 'Pick',
      callback: (nodes: Node[]) => console.log('Picked', nodes),
      type: 'primary'
    },
    {
      label: 'Share',
      callback: (nodes: Node[]) => console.log('Share picked files', nodes),
      type: 'secondary',
      icon: IconShare,
    }
  ]
</script>
```

## Development
### Testing
For testing all components provide `data-testid` attributes as selectors, so the tests are independent from code or styling changes.

### Test selectors
`data-testid`         | Intended purpose
----------------------|-----------------
`select-all-checkbox` | The select all checkbox of the file list
`file-list-row`       | A row in the file list (`tr`), can be identified by `data-filename`
`row-checkbox`        | Checkbox for selecting a row
`row-name`            | Name of the row / file

### 📤 Releasing a new version

- Pull the latest changes from `main` or `stableX`
- Checkout a new branch with the tag name (e.g `v4.0.1`): `git checkout -b v<version>`
- Run `npm version patch --no-git-tag-version` (`npm version minor --no-git-tag-version` if minor).
  This will return a new version name, make sure it matches what you expect
- Generate the changelog content from the [release](https://github.com/nextcloud-libraries/nextcloud-dialogs/releases) page.
  Create a draft release, select the previous tag, click `generate` then paste the content to the `CHANGELOG.md` file
  1. adjust the links to the merged pull requests and authors so that the changelog also works outside of GitHub
     by running `npm run prerelease:format-changelog`.
     This will apply this regex: `by @([^ ]+) in ((https://github.com/)nextcloud-libraries/nextcloud-dialogs/pull/(\d+))`
     Which this as the replacement: `[\#$4]($2) \([$1]($3$1)\)`
  2. use the the version as tag AND title (e.g `v4.0.1`)
  3. add the changelog content as description
- Commit, push and create PR
- Get your PR reviewed and merged
- Create a milestone with the follow-up version at https://github.com/nextcloud-libraries/nextcloud-dialogs/milestones
- Move all open tickets and PRs to the follow-up
- Close the milestone of the version you release
- Publish the previously drafted release on GitHub
  ![image](https://user-images.githubusercontent.com/14975046/124442568-2a952500-dd7d-11eb-82a2-402f9170231a.png)
