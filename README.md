# @nextcloud/dialogs

[![npm](https://img.shields.io/npm/v/@nextcloud/dialogs?style=for-the-badge)](https://www.npmjs.com/package/@nextcloud/dialogs)

Nextcloud dialog helpers

## Installation

```
npm i -S @nextcloud/dialogs
```

## Usage

### Toasts

```js
import { showMessage, showInfo, showSuccess, showWarning, showError } from '@nextcloud/dialogs'
import '@nextcloud/dialogs/dist/index.css'
```

Make sure that the  `@nextcloud/dialogs/dist/index.css` file is included in your app to make sure that the toasts have a proper styling applied.

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

A full list of available options can be found in the [documentation](https://nextcloud.github.io/nextcloud-dialogs/).

## Releasing a new version

- Pull the latest changes from `master` or `stableX`;
- Checkout a new branch with the tag name (e.g `v4.0.1`): `git checkout -b v<version>`;
- Run `npm version patch --no-git-tag-version` (`npm version minor --no-git-tag-version` if minor). This will return a new version name, make sure it matches what you expect;
- Commit, push and create PR;
- Add the change log content from the 'Changelog' action on Github to `CHANGELOG.md`;
- Commit and push;
- Get your PR reviewed and merged;
- Create [a release on github](https://github.com/nextcloud/nextcloud-dialogs/releases) with the version as tag (e.g `v4.0.1`) and add the changelog content as description

![image](https://user-images.githubusercontent.com/14975046/124442568-2a952500-dd7d-11eb-82a2-402f9170231a.png)
