const de = require('../../client/src/i18n/de.json');
const en = require('../../client/src/i18n/en.json');

const getStrings = (locale) => {
	const map = { de, en };
	return map[locale];
};

// this and the following method are currently duplicated here. Need to convert the BE code to use TS
const getI18n = (i18nString, placeholders) => {
	const parts = i18nString.split(/(%\d+)/);
	const parsed = [];

	parts.forEach((part) => {
		if (/%\d+/.test(part)) {
			const index = parseInt(part.replace('%', ''), 10) - 1;

			if (index < placeholders.length) {
				parsed.push(placeholders[index]);

				// if there's no placeholder for this, just add the original value which looked like a placeholder
			} else {
				parsed.push(part);
			}
		} else {
			parsed.push(part);
		}
	});

	return parsed;
};

const getI18nString = (i18nString, placeholders) => getI18n(i18nString, placeholders).join('');

module.exports = {
	getStrings,
	getI18nString
};
