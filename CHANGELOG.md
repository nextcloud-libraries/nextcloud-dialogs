# Changelog

All notable changes to this project will be documented in this file.

## [v5.0.0-beta.5](https://github.com/nextcloud-libraries/nextcloud-dialogs/tree/v5.0.0-beta.5) (2023-10-03)

[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.4...v5.0.0-beta.5)

### :bug: Fixed bugs
* fix: breadcrumbs grow by @skjnldsv in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/987
* Fix alignment of file list by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/993
* fix(FilePicker): Use `search` function from `webdav` package instead of workaround by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/992
* fix(FilePicker): Ensure file list header is shown on top of scrolled content rows by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/997

### :robot: Dependency updates
* chore(deps): Bump @types/toastify-js from 1.12.0 to 1.12.1 by @dependabot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1002
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.5 to 8.0.0-beta.6 by @dependabot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1004
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.21 to 3.0.0-beta.22 by @dependabot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1013
* chore(deps): Bump @nextcloud/files from 3.0.0-beta.22 to 3.0.0-beta.24 by @dependabot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1021
* chore(deps): Bump @nextcloud/vue from 8.0.0-beta.6 to 8.0.0-beta.7 by @dependabot in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1022
* chore: Bump @nextcloud/vue to v8-beta.7 by @Pytal in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/1020

## v5.0.0-beta.4
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.3...v5.0.0-beta.4)

### :bug: Fixed bugs
* fix(FilePicker): Reset selected files if the current directory is changed by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/964
* Revert "fix: Patch `webdav` dependency for invalid `exports` field un… by @skjnldsv in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/984

## v5.0.0-beta.3
[Full Changelog](https://github.com/nextcloud-libraries/nextcloud-dialogs/compare/v5.0.0-beta.2...v5.0.0-beta.3)

### :bug: Fixed bugs
* fix: Make file list only sortable by one property at the time by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/949
* fix: styling issues and make the FilePicker height fixed by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/971
* fix: Use core preview controller for loading file previews and fallback to MDI icons by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/962
* fix(FilePicker): Fix selecting rows using the keyboard by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/934
* fix(FilePicker): Only show checkbox skeletons if multiselect was enabled by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/969
* fix(FilePickerBuilder): Fix paths returned in Promise by `pick` method by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/963
* fix(NcDialog): Make the heading always center aligned on top by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/965

### :rocket: Enhancement
* feat(FilePickerBuilder): Allow to configure the dialog container element by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/950

### :robot: Dependency updates
* chore: Update `@nextcloud/files` version by @susnux in https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/952
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
