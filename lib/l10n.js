import { getGettextBuilder } from '@nextcloud/l10n/dist/gettext'

let _n, _t = null

// Used to prevent side effects when importing.
function initL10n() {
	if (_n !== null) {
		return
	}

	const gtBuilder = getGettextBuilder()
		.detectLocale()

	process.env.TRANSLATIONS
		.map(data => gtBuilder.addTranslation(data.locale, data.json))

	const gt = gtBuilder.build()

	_n = gt.ngettext.bind(gt)
	_t = gt.gettext.bind(gt)
}

/**
 * Translate a string
 *
 * @param {string} app the id of the app for which to translate the string
 * @param {string} text the string to translate
 * @param {object} vars map of placeholder key to value
 * @param {number} count to replace %n with
 * @param {object} [options] options object
 * @return {string}
 */
export function n(app, text, vars, count, options) {
	initL10n()
	return _n(app, text, vars, count, options)
}

/**
 * Translate a plural string
 *
 * @param {string} app the id of the app for which to translate the string
 * @param {string} textSingular the string to translate for exactly one object
 * @param {string} textPlural the string to translate for n objects
 * @param {number} count number to determine whether to use singular or plural
 * @param {Object} vars of placeholder key to value
 * @param {object} options options object
 * @return {string}
 */
export function t(app, textSingular, textPlural, count, vars, options) {
	initL10n()
	return _t(app, textSingular, textPlural, count, vars, options)
}
