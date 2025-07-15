import { createI18n, type I18n, type I18nOptions } from "vue-i18n";

import { datetimeFormats } from "./formats";

// datetimeFormats is now imported from formats.ts

export default function initI18N(opts: I18nOptions = {}): I18n {
	return createI18n({
		missingWarn: false,
		fallbackWarn: false,
		legacy: false,
		datetimeFormats,
		...opts,
	});
}
