<!--
  - SPDX-FileCopyrightText: 2020-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Changelog

All notable changes to this project will be documented in this file.

## [v6.3.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.3.0...v6.3.1)
### 🐛 Fixed bugs
* [stable6] fix: display guest name validity by @skjnldsv in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1837

## [v6.3.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.2.0...v6.3.0)
### 🚀 Enhancements
* [stable6] feat: add guest auth prompt component by @skjnldsv in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1759
### 🐛 Fixed bugs
* [stable6] fix(FilePickerBuilder): correctly return array / plain value depending on multiselect by @backportbot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1777
### Other Changes
* Updates for project Nextcloud dialogs library by @transifex-integration in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1740
* Updates for project Nextcloud dialogs library by @transifex-integration in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1741
* Update @nextcloud/auth to 2.5.0 by @skjnldsv

## [v6.2.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.1.1...v6.2.0)
### Notes

The export of the file picker Vue component is deprecated and will be removed in the next version.
Instead please use the `FilePickerBuilder`.

The `Dialog.hide` method is deprecated.
Instead only user interaction should close dialogs,
for this use the promise returned by `Dialog.show` which will resolve if the user answered the dialog and rejected if the user aborted (closed) the dialog.

### Added
* feat: allow picking files using the Nextcloud Nodes API [\#1730](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1730) \([susnux](https://github.com/susnux)\)

### Fixed
* fix(file-picker): align folder design with Nextcloud files app [\#1733](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1733) \([susnux](https://github.com/susnux)\)
* fix: the nc-vue dialogs function module is called `dialog` not `dialogs` [\#1732](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1732) \([susnux](https://github.com/susnux)\)
* perf: do not pre-load folder mime icon [\#1734](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1734) \([susnux](https://github.com/susnux)\)

### Changed
* docs: Update README.md [\#1627](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1627) \([susnux](https://github.com/susnux)\)
* chore: update workflows [\#1609](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1609) \([susnux](https://github.com/susnux)\)
* chore: simplify vitest config and fix some build issues [\#1606](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1606) \([susnux](https://github.com/susnux)\)
* chore: supported branches [\#1608](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1608) \([susnux](https://github.com/susnux)\)
* chore: prepare for vue3 migration [\#1681](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1681) \([ShGKme](https://github.com/ShGKme)\)
* chore: deprecate export of filepicker Vue component [\#1728](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1728) \([susnux](https://github.com/susnux)\)
* chore: Nextcloud 28 is EOL so is nextcloud-dialogs v5 [\#1729](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1729) \([susnux](https://github.com/susnux)\)
* chore: deprecate `Dialog.hide` [\#1731](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1731) \([susnux](https://github.com/susnux)\)
* chore(deps): Bump axios to 1.8.2
* chore(deps): Bump webdav to 5.8.0
* chore(deps): Bump dompurify to 3.2.4
* chore(deps): Bump `@nextcloud/event-bus` to 3.3.2
* chore(deps): Bump `@nextcloud/files` to 3.10.2
* chore(deps): Bump `@nextcloud/l10n` to 3.2.0
* chore(deps): Bump `@vueuse/core` to 11.3.0

## 6.1.1
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.1.0...v6.1.1)

## Fixed
* fix(toast): loading svg [\#1559](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1559) \([skjnldsv](https://github.com/skjnldsv)\)
* fixed css output file via @nextcloud/vite-config update

## Changed
* chore(deps): Bump p-queue from 8.0.1 to 8.1.0
* chore(deps-dev): Bump @nextcloud/vite-config from 1.5.0 to 1.5.1
* chore(deps-dev): Bump @vitest/coverage-v8 from 2.1.8 to 3.0.3
* chore(deps-dev): Bump happy-dom from 16.7.1 to 16.7.2
* chore(deps-dev): Bump vite from 6.0.7 to 6.0.9
* chore(deps-dev): Bump vite from 6.0.9 to 6.0.11
* chore(deps-dev): Bump vitest from 2.1.8 to 3.0.3

## 6.1.0
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.0.1...v6.1.0)

### Enhancements
* feat(toast): add loading toast [\#1554](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1554) \([skjnldsv](https://github.com/skjnldsv)\)
* feat(files): Add encrypted icon for end-to-end encrypted folder [\#1545](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1545) \([JuliaKirschenheuter](https://github.com/JuliaKirschenheuter)\)

### Fixed
* Fix npm audit [\#1502](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1502) \([nextcloud-command](https://github.com/nextcloud-command)\)

### Changed
* Updated translations
* Updated development dependencies

## 6.0.1
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v6.0.0...v6.0.1)

### Fixed
* fix: Mention supported versions in README [\#1422](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1422) \([susnux](https://github.com/susnux)\)
* fix: Rate-limit image previews [\#1478](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1478) \([susnux](https://github.com/susnux)\)

### Changed
* Updated translations
* Updated development dependencies
* chore(deps): Bump @nextcloud/auth to 2.4.0
* chore(deps): Bump @vueuse/core to 11.2.0
* chore(deps): Bump @nextcloud/files to 3.9.0
* chore(deps): Bump dompurify to 3.1.6
* chore(deps): Bump @nextcloud/axios to 2.5.1

## 6.0.0
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.5...v6.0.0)

### Breaking

v6.0.0 is only compatible with Nextcloud 29 and newer.
Technically this is the same as v5.3.5, but v5.3.3 was a breaking change as it dropped support for Nextcloud 28 and older on public shares.

### Changed
* chore: Enhance docs about generic dialogs and export all related types [\#1380](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1380) \([susnux](https://github.com/susnux)\)
* Migrate REUSE to TOML format [\#1386](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1386) \([AndyScherzinger](https://github.com/AndyScherzinger)\)
* chore(deps): Bump @nextcloud/typings to 1.9.1
* chore(deps): Bump @nextcloud/sharing to 0.2.3
* chore(deps): Bump fast-xml-parser to 4.4.1
* chore(deps): Bump @nextcloud/files to 3.8.0
* chore(deps): Bump @vueuse/core to 10.11.1
* chore(deps): Bump webdav to 5.7.1
* chore(deps): Bump axios to 1.7.4

## 5.3.5
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.4...v5.3.5)

### Fixed
* fix(FilePicker): Cleanup DAV handling and properly handle `currentFolder` [\#1378](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1378) \([susnux](https://github.com/susnux)\)

### Changed
* Updated translations
* chore(deps): Bump @nextcloud/typings from 1.8.0 to 1.9.0
* chore(deps-dev): Bump typedoc from 0.26.0 to 0.26.3
* chore(deps-dev): Bump @zamiell/typedoc-plugin-not-exported from 0.2.0 to 0.3.0
* chore(deps-dev): Bump vite from 5.3.1 to 5.3.2

## 5.3.4
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.3...v5.3.4)

### Fixed
* fix(FilePicker): Forward update of `currentPath` to `navigatedPath` [\#1370](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1370) \([susnux](https://github.com/susnux)\)

### Changed
* chore(deps-dev): Bump sass to 1.77.6
* chore(deps-dev): Bump @nextcloud/vite-config to 1.3.0
* chore(deps-dev): Bump happy-dom to 14.12.3
* chore(deps-dev): Bump typedoc to 0.26.0
* chore(deps-dev): Bump typescript to 5.5.2

## [v5.3.3](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.3.3) (2024-06-21)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.2...v5.3.3)

### Fixed
* fix: Use `shallowRef` instead of `shallowReactive` because Vue 2 limitation
* fix: Prevent invalid range for skeleton number

### Changed
* refactor: `@nextcloud/files` is now aware of public shares also now have `@nextcloud/sharing` [\#1361](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1361) \([susnux](https://github.com/susnux)\)
* refactor: Use sorting function from files library
* Add SPDX header [\#1354](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1354) \([AndyScherzinger](https://github.com/AndyScherzinger)\)
* chore(deps-dev): Bump braces from 3.0.2 to 3.0.3
* chore(deps): Bump @vueuse/core from 10.10.0 to 10.11.0
* chore(deps-dev): Bump sass from 1.77.4 to 1.77.5
* chore(deps-dev): Bump vite from 5.2.13 to 5.3.1

## [v5.3.2](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.3.2) (2024-06-10)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.1...v5.3.2)

### Fixed
* fix: Also add current folder to button factory [\#1351](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1351) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Do not append image preloader to DOM [\#1340](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1340) \([susnux](https://github.com/susnux)\)

### Changed
* Updated translations
* chore(deps): Bump webdav to 5.6.0
* chore(deps): Bump @nextcloud/router to 3.0.1
* chore(deps): Bump @nextcloud/auth to 2.3.0
* chore(deps): Bump @nextcloud/axios to 2.5.0
* chore(deps): Bump @nextcloud/initial-state to 2.2.0
* chore(deps): Bump @nextcloud/l10n to 3.1.0
* chore(deps): Bump @nextcloud/event-bus to 3.3.1
* chore(deps): Bump @vueuse/core to 10.10.0
* chore(deps): Bump @nextcloud/files to 3.4.1

## [v5.3.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.3.1) (2024-04-16)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.3.0...v5.3.1)

### Fixes
* fix: Close actions after creating directory and enter it automatically [\#1302](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1302) \([susnux](https://github.com/susnux)\)
* fix: Fix incorrect directory contents when navigating quickly [\#1299](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1299) \([Pytal](https://github.com/Pytal)\)

### Changed
* Dependency updates

## [v5.3.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.3.0) (2024-04-10)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.2.1...v5.3.0)

### Enhancements
* feat: Provide generic dialogs previously provided by OC.dialogs [\#1297](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1297) \([susnux](https://github.com/susnux)\)

### Changed
* Updated development dependencies

## [v5.2.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.2.1) (2024-04-09)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.2.0...v5.2.1)

### Fixed bug
* fix(FilePicker): Request all default file props (incl. file id) [\#1287](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1287) \([susnux](https://github.com/susnux)\)

### Changed
* Updated translations
* Updated development dependencies
* chore(deps): Bump @nextcloud/files from 3.1.0 to 3.1.1
* chore(deps): Bump webdav from 5.4.0 to 5.5.0

## [v5.2.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.2.0) (2024-03-06)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.1.2...v5.2.0)

### Enhancements
* feat: allow to disable file picker navigation [\#1261](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1261) \([skjnldsv](https://github.com/skjnldsv)\)

### Fixed bug
* fix(FilePicker): Adjust margin of view-selector to be consistent with filter input

### Changed
* chore(deps-dev): Bump @vitest/coverage-v8 from 1.3.0 to 1.3.1 by @dependabot
* chore(deps-dev): Bump happy-dom from 13.3.8 to 13.6.2 by @dependabot
* chore(deps-dev): Bump sass from 1.71.0 to 1.71.1 by @dependabot
* chore(deps-dev): Bump typedoc from 0.25.8 to 0.25.9 by @dependabot
* chore(deps-dev): Bump vite from 5.1.3 to 5.1.4 by @dependabot
* chore(deps): Bump @nextcloud/typings from 1.7.0 to 1.8.0 by @dependabot
* chore(deps): Bump @vueuse/core from 10.7.2 to 10.9.0 by @dependabot
* chore(deps): Bump webdav from 5.3.2 to 5.4.0 by @dependabot
* Updates for project Nextcloud dialogs library by @transifex-integration

## [v5.1.2](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.1.2) (2024-02-25)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.1.1...v5.1.2)

### :bug: Fixed bugs
* fix(FilePicker): Allow using on public shares [\#1241](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1241) \([susnux](https://github.com/susnux)\)
* enh: breadcrumbs are now consistant across server [\#1234](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1234) \([emoral435](https://github.com/emoral435)\)

### Changed
* Updated translations
* Updated dependencies `@nextcloud/router` and `webdav`
* Updated development dependencies

## [v5.1.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.1.1) (2024-01-26)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.1.0...v5.1.1)

### :bug: Fixed bugs
* fix(FilePicker): Stop default close event in case of button press [\#1207](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1207) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Export `FilePickerClosed` error [\#1198](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1198) \([susnux](https://github.com/susnux)\)

### Changed
* Updated translations
* Updated development dependencies

## [v5.1.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.1.0) (2024-01-19)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.3...v5.1.0)

### :rocket: Enhancement
* enh(FilePickerBuilder): Change error thrown when FilePicker is closed [\#1166](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1166) \([susnux](https://github.com/susnux)\)

### :bug: Fixed bugs
* fix(FilePicker): Adjust stylings after migration to `NcDialog` [\#1138](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1138) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Set default of `path` to undefined to allow using the saved path [\#1137](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1137) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Use `Node::path` for current path fixing an clicking favorite folders [\#1165](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1165) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Stop click event on checkbox column to allow multiselect [\#1192](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1192) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Adjust checkbox position [\#1193](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1193) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): Improve choose button text when selecting multiple [\#1191](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1191) \([susnux](https://github.com/susnux)\)
* Remove unneeded `tab`, `tablist` and `aria-selected` roles from navigation [\#1180](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1180) \([JuliaKirschenheuter](https://github.com/JuliaKirschenheuter)\)
* Remove `aria-label` from `<div>` [\#1179](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1179) \([JuliaKirschenheuter](https://github.com/JuliaKirschenheuter)\)

### Changed
* Updated translations
* Updated dependencies

## [v5.0.3](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.3) (2023-11-27)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.2...v5.0.3)

### :bug: Fixed bugs
* fix(FilePicker): `cropImagePreviews` is now provided as a prop in FilePreview [\#1120](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1120) \([susnux](https://github.com/susnux)\)
* fix(FilePicker): On button click also emit the current directory if `allowPickDirectory` is set to true [\#1121](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1121) \([susnux](https://github.com/susnux)\)
* fix: Adjust types for IFilePickerButton to align icon with NcDialogButton [\#1122](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1122) \([susnux](https://github.com/susnux)\)
* fix(build): include ?raw data to bundle [\#1128](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1128) \([ShGKme](https://github.com/ShGKme)\)

### Changed
* Updated translations
* chore(deps): Bump @vueuse/core from 10.6.0 to 10.6.1
* chore(deps-dev): Bump typescript from 5.2.2 to 5.3.2

## [v5.0.2](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.2) (2023-11-17)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.1...v5.0.2)

### :bug: Fixed bugs
* fix(FilePicker): Listen on `update:open` rather than `closed` event from `NcDialog` [\#1113](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1113) ([@susnux](https://github.com/susnux))

### Changed
* Updated translations
* chore(deps): Bump `@nextcloud/vue` from 8.2.0

## [v5.0.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.1) (2023-11-15)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0...v5.0.1)

### :bug: Fixed bugs
* Do not load user config for each previews [\#1108](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1108) ([artonge](https://github.com/artonge))

### Changed
* Updated translations
* chore(deps-dev): Bump @types/gettext-parser from 4.0.3 to 4.0.4
* chore(deps): Bump @vueuse/core from 10.5.0 to 10.6.0
* chore(deps): Bump @types/toastify-js from 1.12.2 to 1.12.3
* chore(deps): Bump axios from 1.4.0 to 1.6.1

## [v5.0.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.0) (2023-11-08)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.6...v5.0.0)

### :rocket: Enhancement
* FilePicker: Signal folder creation to files app [\#1095](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1095) ([@susnux](https://github.com/susnux))

### :bug: Fixed bugs
* fix: Use `NcDialog` instead of custom dialog component now that it is upstreamed [\#1101](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1101) ([@susnux](https://github.com/susnux))

### Changed
* Updated translations
* Updated dependencies
  * Now using stable `@nextcloud/vue` version 8.0.0
  * Now using stable `@nextcloud/files` version 3.0.0

## [v5.0.0-beta.6](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.0-beta.6) (2023-10-17)
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.5...v5.0.0-beta.6)

### :boom: Breaking changes
The FilePicker Vue component is no longer exported in the main entry point.
Instead it is exported in a filepicker entrypoint, and the FilePicker builder is also now loading it async. This ensures that if a user does not use the filepicker, it gets treeshaken.

### :rocket: Enhancement
* Get files app config and use it for the file picker [\#973](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/973) ([@susnux](https://github.com/susnux))

### :bug: Fixed bugs
* fix(i18n): Fix spelling of MIME [\#1041](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1041) ([@rakekniven](https://github.com/rakekniven))
* fix: Swap sort icons [\#1058](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1058) ([@Pytal](https://github.com/Pytal))
* fix(FilePicker): Make the validity strings more specific [\#1072](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1072) ([@susnux](https://github.com/susnux))
* fix: Ensure the dialog name can be wrapped if needed [\#1074](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1074) ([@susnux](https://github.com/susnux))

### Changed
* chore: Switch to v8 as code coverage provider, reduces the dependencies [\#1043](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1043) ([@susnux](https://github.com/susnux))
* Combine vite and vitest config [\#1070](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1070) ([@susnux](https://github.com/susnux))
* Remove non existing legacy entry point from package.json [\#1070](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1070) ([@susnux](https://github.com/susnux))

### :robot: Dependency updates
* Updated translations
* chore(deps): Bump postcss from 8.4.27 to 8.4.31 [\#1038](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1038)
* chore(deps-dev): Bump sass from 1.68.0 to 1.69.0 [\#1048](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1048)
* chore(deps-dev): Bump vite from 4.4.9 to 4.4.11 [\#1046](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1046)
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.24 to 3.0.0-beta.25 [\#1047](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1047)
* chore(deps-dev): Bump @nextcloud/vite-config from 1.0.0-beta.19 to 1.0.1 [\#1049](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1049)
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.7 to 8.0.0-beta.8 [\#1050](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1050)
* chore(deps-dev): Bump happy-dom from 12.2.1 to 12.9.0 [\#1051](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1051)
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.25 to 3.0.0-beta.26 [\#1061](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1061)
* chore(deps): Bump @vueuse/core from 10.4.1 to 10.5.0 [\#1063](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1063)
* chore(deps-dev): Bump typedoc from 0.25.1 to 0.25.2 [\#1062](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1062)
* chore(deps-dev): Bump @mdi/svg from 7.2.96 to 7.3.67 [\#1065](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1065)
* chore(deps-dev): Bump sass from 1.69.0 to 1.69.3 [\#1064](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1064)
* chore(deps-dev): Bump happy-dom from 12.9.0 to 12.9.1 [\#1066](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1066)
* chore(deps): Bump @babel/traverse from 7.23.0 to 7.23.2 [\#1069](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1069)

## New Contributors
* [@rakekniven](https://github.com/rakekniven) made their first contribution in [\#1041](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1041)


## [v5.0.0-beta.5](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.0-beta.5) (2023-10-03)

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.4...v5.0.0-beta.5)

### :bug: Fixed bugs
* fix: breadcrumbs grow [\#987](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/987) ([skjnldsv](https://github.com/skjnldsv))
* Fix alignment of file list [\#993](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/993) ([susnux](https://github.com/susnux))
* fix(FilePicker): Use `search` function from `webdav` package instead of workaround [\#992](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/992) ([susnux](https://github.com/susnux))
* fix(FilePicker): Ensure file list header is shown on top of scrolled content rows [\#997](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/997) ([susnux](https://github.com/susnux))

### :robot: Dependency updates
* chore(deps): Bump @types/toastify-js from 1.12.0 to 1.12.1 [\#1002](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1002)
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.5 to 8.0.0-beta.6 [\#1004](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1004)
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.21 to 3.0.0-beta.22 [\#1013](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1013)
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.22 to 3.0.0-beta.24 [\#1021](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1021)
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.6 to 8.0.0-beta.7 [\#1022](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1022)
* chore: Bump @nextcloud/vue to v8-beta.7 by @Pytal in [\#1020](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1020)

## v5.0.0-beta.4
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.3...v5.0.0-beta.4)

### :bug: Fixed bugs
* fix(FilePicker): Reset selected files if the current directory is changed [\#964](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/964) ([susnux](https://github.com/susnux))
* Revert "fix: Patch `webdav` dependency for invalid `exports` field un… [\#984](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/984) ([skjnldsv](https://github.com/skjnldsv))

## v5.0.0-beta.3
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.2...v5.0.0-beta.3)

### :bug: Fixed bugs
* fix: Make file list only sortable by one property at the time [\#949](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/949) ([susnux](https://github.com/susnux))
* fix: styling issues and make the FilePicker height fixed [\#971](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/971) ([susnux](https://github.com/susnux))
* fix: Use core preview controller for loading file previews and fallback to MDI icons [\#962](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/962) ([susnux](https://github.com/susnux))
* fix(FilePicker): Fix selecting rows using the keyboard [\#934](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/934) ([susnux](https://github.com/susnux))
* fix(FilePicker): Only show checkbox skeletons if multiselect was enabled [\#969](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/969) ([susnux](https://github.com/susnux))
* fix(FilePickerBuilder): Fix paths returned in Promise by `pick` method [\#963](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/963) ([susnux](https://github.com/susnux))
* fix(NcDialog): Make the heading always center aligned on top [\#965](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/965) ([susnux](https://github.com/susnux)) ([susnux](https://github.com/susnux))

### :rocket: Enhancement
* feat(FilePickerBuilder): Allow to configure the dialog container element [\#950](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/950) ([susnux](https://github.com/susnux))

### :robot: Dependency updates
* chore: Update `@nextcloud/files` version [\#952](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/952) ([susnux](https://github.com/susnux))
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.19 to 3.0.0-beta.21
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.3 to 8.0.0-beta.5
* chore(deps): Bump webdav from 5.2.3 to 5.3.0

## v5.0.0-beta.2
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.1...v5.0.0-beta.2)

### :rocket: Enhancement
- feat: Add icons for filepicker and allow reactive button based on current path and selection [\#938](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/938) ([susnux](https://github.com/susnux))
- feat\(FilePicker\): Always show file extension as a trailing text part [\#931](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/931) ([susnux](https://github.com/susnux))
- Add empty content when there are no files [\#930](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/930) ([susnux](https://github.com/susnux))

### :bug: Fixed bugs
- fix: The file list should be showed when files are loading [\#937](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/937) ([susnux](https://github.com/susnux))
- fix\(FilePicker\): Ensure focus-visible outline is visible for all focusable elements [\#935](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/935) ([susnux](https://github.com/susnux))
- fix\(FilePicker\): Do not show checkboxes on single select mode [\#929](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/929) ([susnux](https://github.com/susnux))
- fix: Add missing defaults to DialogButton [\#927](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/927) ([susnux](https://github.com/susnux))
- fix\(FilePickerBuilder\): Revert API change on `pick()` [\#925](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/925) ([susnux](https://github.com/susnux))
- fix\(FilePicker\): The table height should be max. 100% [\#921](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/921) ([susnux](https://github.com/susnux))

### Changed
- Update `@nextcloud/files` and add unit tests [\#917](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/917) ([susnux](https://github.com/susnux))

## v5.0.0-beta.1 (2023-08-18)

### :boom: Breaking
- A Vue based file picker is provided which uses `@nextcloud/vue` version 8, so this library will only work on Nextcloud 28+
- Modernize FilePickerBuilder to directly make use of the Vue based file picker [\#904](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/904) \([@susnux](https://github.com/susnux)\)
  - This slightly breaks the FilePickerBuilder API:
    - `FilePicker.pick` now returns a Promise resolving to `string[]` containing the picked paths
    - `FilePicker.constructor` parameter order was changed
    - `FilePickerBuilder.setModal` was removed as it has no effect
    - `FilePickerBuilder.setType` is deprecated in favor of `FilePickerBuilder.addButton`
    - `FilePickerBuilder.addButton` was added which allows to add custom buttons with callbacks on click (so users can now distinguish which button was clicked)

### :rocket: Enhancement
- A Vue based FilePicker component was added, which can be used either as a component or using programmatically [\#878](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/878) ([@susnux](https://github.com/susnux))
- FilePickerBuilder: Allow to add custom buttons [\#896](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/896) \([@susnux](https://github.com/susnux)\)

### :bug: Fixed bugs
- Fixed some design flaws in new FilePicker component
  - Adjust color of placeholder skeletons [\#880](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/880) ([@susnux](https://github.com/susnux))
  - Fix column alignment to be consistent with files app [\#881](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/881) ([@susnux](https://github.com/susnux))
  - Navigation and filter should be on separate rows on mobile [\#882](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/882) ([@susnux](https://github.com/susnux))
  - Adjust filepicker breadcrumbs button for design review [\#892](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/892) ([@susnux](https://github.com/susnux))
  - Ensure only the file table is scrolled [\#899](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/899) \([@susnux](https://github.com/susnux)\)
- FilePicker: Request `oc:size` property for showing the file size [\#893](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/893) ([@susnux](https://github.com/susnux))
- FilePicker: Fix exported typings and cleanup file picker files [\#903](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/903) \([@susnux](https://github.com/susnux)\)

### Changed
- The package does no longer contain core-js polyfills as Nextcloud core already provides polyfills [#863](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/863) ([@susnux](https://github.com/susnux))
- The project was moved to a new Github organization (*nextcloud-libraries*)
- Add version compatibility section to README [\#891](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/891) ([@susnux](https://github.com/susnux))
- Improved developer documentation [\#906](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/906) \([@susnux](https://github.com/susnux)\)
- Dependency updates

## v4.1.0 (2023-06-23)

### :bug: Fixed bugs

- Make sure Typescript projects with `node16` module resolution can import the package [\#845](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/845) ([@susnux](https://github.com/susnux))
- Ensure all package dependencies are external [\#843](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/843) ([@susnux](https://github.com/susnux))

### Changed

- Update Node engines to next LTS (version 20)
- Translation updates
- Dependency updates

## v4.0.1 (2023-02-16)

#### :rocket: Enhancement
* [#760](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/760) feat: Make dependencies external ([@susnux](https://github.com/susnux))

#### :bug: Bug Fix
* [#761](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/761) Fix package resolving in webpack projects ([@susnux](https://github.com/susnux))

#### Committers: 2
- Ferdinand Thiessen ([@susnux](https://github.com/susnux))
- Julius Härtl ([@juliushaertl](https://github.com/juliushaertl))

## v4.0.0 (2023-02-13)

### :boom: Breaking changes

Styles need to be imported differently compared to v3.2.0. Make sure to import them from `dist/index.css`:

	import '@nextcloud/dialogs/dist/index.css'


### :rocket: Enhancement
* [#577](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/577) Add filepicker filter ([@Pytal](https://github.com/Pytal))

### Committers: 2
- Ferdinand Thiessen ([@susnux](https://github.com/susnux))
- [@Pytal](https://github.com/Pytal)


## [v4.0.0-beta.2](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v4.0.0-beta.2) (2022-11-02)

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v4.0.0-beta.1...v4.0.0-beta.2)

### :bug: Fixed bugs

- Fix exports [\#699](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/699) ([skjnldsv](https://github.com/skjnldsv))

## [v4.0.0-beta.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v4.0.0-beta.1) (2022-11-02)

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v4.0.0-beta.0...v4.0.0-beta.1)

### :bug: Fixed bugs

- Do not change css class names when building [\#694](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/694) ([skjnldsv](https://github.com/skjnldsv))

## [v4.0.0-beta.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v4.0.0-beta.0) (2022-10-28)

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.2.0...v4.0.0-beta.0)

### :bug: Fixed bugs

- Url encode svg and ship it [\#691](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/691) ([skjnldsv](https://github.com/skjnldsv))

### Changed

- Translation updates
- Dependency updates

## [v3.2.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.2.0) - 2022-08-10

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.1.4...v3.2.0)

### Changed

- Update engines to Node 16 with Npm 7 or Npm 8
- Translation updates
- Dependency updates

## [v3.1.4](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.1.4) - 2022-07-21

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.1.4...v3.1.3)

### Changed

- Fixed dark mode with Nextcloud 25 - [\#630](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/630) ([nickvergessen](https://github.com/nickvergessen))

## [v3.1.3](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.1.3) - 2022-07-21

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.1.3...v3.1.2)

### Added

- Export FilePickerType enum [\#556](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/556) [Pytal](https://github.com/Pytal)

### Changed

- Replace deprecated String.prototype.substr - [\#553](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/553) ([CommanderRoot](https://github.com/CommanderRoot))
- Fix undo toast rendering - [\#582](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/582) ([artonge](https://github.com/artonge))
- Bump toastify-js and set aria-live default and allow to overwrite it - [\#622](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/622) ([nickvergessen](https://github.com/nickvergessen))
- Bumped dependencies
- Translations updated

## [v3.1.2](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.1.2) - 2021-04-12

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.1.2...v3.1.1)

### Changed

- Bump @babel/cli from 7.12.1 to 7.13.14 - [\#241](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/241) [\#242](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/242) [\#254](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/254) [\#284](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/284) [\#325](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/325) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @babel/core from 7.12.3 to 7.13.14 - [\#237](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/237) [\#244](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/244) [\#252](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/252) [\#285](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/285) [\#326](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/326) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump babel-loader-exclude-node-modules-except from 1.0.3 to 1.1.2 - [\#288](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/288) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @babel/preset-env from 7.12.1 to 7.13.12 - [\#240](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/240) [\#253](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/253) [\#256](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/256) [\#279](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/280) [\#308](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/308) [\#324](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/324) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @babel/preset-typescript from 7.12.1 to 7.12.13 - [\#238](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/238) [\#282](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/282) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump core-js from 3.7.0 to 3.9.1 - [\#243](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/243) [\#251](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/251) [\#262](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/262) [\#309](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/309) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump highlight.js from 10.2.0 to 10.4.1 - [\#245](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/245) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump rollup from 2.33.1 to 2.38.5 - [\#239](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/239) [\#247](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/247) [\#250](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/250) [\#257](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/257) [\#266](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/266) [\#283](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/283) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @rollup/plugin-babel from 5.2.1 to 5.3.0 - [\#249](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/249) [\#298](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/298) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @rollup/plugin-commonjs from 16.0.0 to 18.0.0 - [\#248](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/248) [\#323](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/323) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump @rollup/plugin-node-resolve from 10.0.0 to 11.2.1 - [\#246](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/246) [\#258](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/258) [\#319](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/319) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump rollup-plugin-typescript2 from 0.29.0 to 0.30.0 - [\#322](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/322) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump ToastifyJS from 1.9.1 to 1.10.0 - [\#328](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/328) ([LukasReschke](https://github.com/LukasReschke))
- Bump tslib from 2.0.3 to 2.1.0 - [\#265](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/265)  ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Bump typescript from 4.0.5 to 4.0.7 - [\#312](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/312) ([dependabot[bot]](49699333+dependabot[bot]@users.noreply.github.com))
- Translation updates - [\#259](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/259) [\#263](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/263) [\#273](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/273) [\#274](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/274) [\#311](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/311)

## [v3.1.1](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.1.1) - 2020-11-13

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.1.0...v3.1.1)

### Fixed

- Increased z-index for toast notifications so that they can appear on top of modals as well [\#236](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/236) ([PVince81](https://github.com/PVince81))

## [v3.1.0](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v3.1.0) - 2020-10-20

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v3.0.0...v3.1.0)

### Added

- Close button style for dark mode [\#1526](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/222) ([PVince81](https://github.com/PVince81))

## 3.0.0 - 2020-10-08
### Breaking
- Timeouts are now in milliseconds
### Added
- Now exports TOAST_UNDO_TIMEOUT, TOAST_DEFAULT_TIMEOUT and TOAST_PERMANENT_TIMEOUT
### Fixed
- Fix timeout of showUndo

## 2.0.1 - 2020-08-27
### Fixed
- Fix timeout of showUndo to 10 seconds

## 2.0.0 - 2020-08-17
### Breaking
- Now you must configure some svg loader for your bundler in project (webpack etc.)
### Added
- Undo methods
- SVG icons
### Changed
- Timeout value for permanent must be -1 now instead of 0
- Build process with rollup
- Dependency updates

## 1.4.0 - 2020-06-05
### Added
- Nextcloud 19 typings
### Changed
- Dependency updates

## 1.3.1 - 2020-05-27
### Changed
- Dependency updates
### Fixed
- Toasts not sticky

## 1.3.0 - 2020-02-04
### Changed
- Dependency updates
### Fixed
- Persistent notifications
- Broader version ranges for dependencies to prevent bloat

## 1.2.2 - 2020-03-19
### Changed
- Dependency updates
### Fixed
- Update vulnerable packages

## 1.2.1 - 2020-03-06
### Fixed
- Use `body` as selector by default, so guest pages work as well

## 1.2.0 - 2020-03-03
### Added
- Configurable Toasts selector (for tests)

## 1.1.0 - 2020-02-04
### Added
- Toasts
