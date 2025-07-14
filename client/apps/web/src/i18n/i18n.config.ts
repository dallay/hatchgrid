import {
	createI18n,
	type I18n,
	type I18nOptions,
	type IntlDateTimeFormats,
} from "vue-i18n";

const datetimeFormats: IntlDateTimeFormats = {
	en: {
		short: {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		},
		medium: {
			year: "numeric",
			month: "short",
			day: "numeric",
			weekday: "short",
			hour: "numeric",
			minute: "numeric",
		},
		long: {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
			hour: "numeric",
			minute: "numeric",
		},
	},
	es: {
		short: {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		},
		medium: {
			year: "numeric",
			month: "short",
			day: "numeric",
			weekday: "short",
			hour: "numeric",
			minute: "numeric",
		},
		long: {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
			hour: "numeric",
			minute: "numeric",
		},
	},
};

export default function initI18N(opts: I18nOptions = {}): I18n {
	return createI18n({
		missingWarn: false,
		fallbackWarn: false,
		legacy: false,
		datetimeFormats,
		...opts,
	});
}
