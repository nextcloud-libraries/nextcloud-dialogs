import { GettextExtractor, JsExtractors } from 'gettext-extractor'

let extractor = new GettextExtractor();

extractor
	.createJsParser([
		JsExtractors.callExpression('t', {
			arguments: {
				text: 0,
			}
		}),
		JsExtractors.callExpression('n', {
			arguments: {
				text: 1,
				textPlural: 2,
			}
		}),
	])
	.parseFilesGlob('./lib/**/*.@(ts|js|vue)');

extractor.savePotFile('./l10n/messages.pot');

extractor.printStats();
