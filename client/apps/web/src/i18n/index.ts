import { createI18n } from "vue-i18n";
import { getLocaleModules } from "./load.locales.ts";

export interface Language {
	name: string;
	code: string;
}

const messages = {
	en: getLocaleModules("en"),
	es: getLocaleModules("es"),
};

export const LANGUAGES: ReadonlyArray<Language> = [
	{ name: "English", code: "en" },
	{ name: "Español", code: "es" },
] as const;

export const SUPPORTED_LOCALES = LANGUAGES.map(
	(lang) => lang.code,
) as readonly Language["code"][];
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = LANGUAGES[0].code;

export const LANGUAGE_STORAGE_KEY = "currentLanguage";

function getLocale(): SupportedLocale {
	const stored = localStorage.getItem("locale") as SupportedLocale;
	if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
	const browserLocale = navigator.language.split("-")[0];
	return SUPPORTED_LOCALES.includes(browserLocale)
		? browserLocale
		: DEFAULT_LOCALE;
}

export const i18n = createI18n({
	legacy: false,
	locale: getLocale(),
	fallbackLocale: "en",
	messages,
	globalInjection: true,
});

/**
 * Sets the application locale and updates i18n messages.
 * Loads and merges locale messages using getLocaleModules (deepmerge).
 * Persists the selected locale in localStorage and updates <html lang>.
 * @param locale SupportedLocale
 */
export async function setLocale(locale: SupportedLocale) {
	if (!i18n.global.availableLocales.includes(locale)) {
		i18n.global.setLocaleMessage(locale, getLocaleModules(locale));
	}
	i18n.global.locale.value = locale;
	localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
	document.documentElement.lang = locale;
}
