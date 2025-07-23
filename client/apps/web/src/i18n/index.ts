import { createI18n } from "vue-i18n";
import { getLocaleModules, type LocaleMessages } from "./load.locales.ts";

export interface Language {
	name: string;
	code: string;
}

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
	try {
		const stored = localStorage.getItem(
			LANGUAGE_STORAGE_KEY,
		) as SupportedLocale;
		if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
	} catch {
		// localStorage might not be available (SSR, private browsing, etc.)
	}

	try {
		const browserLocale = navigator.language.split("-")[0] as SupportedLocale;
		if (SUPPORTED_LOCALES.includes(browserLocale)) return browserLocale;
	} catch {
		// navigator.language might not be available
	}

	return DEFAULT_LOCALE;
}

// Initialize with only the current locale to improve startup performance
const currentLocale = getLocale();
const messages: Record<string, LocaleMessages> = {
	[currentLocale]: getLocaleModules(currentLocale),
};

export const i18n = createI18n({
	legacy: false,
	locale: currentLocale,
	fallbackLocale: DEFAULT_LOCALE,
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
	const targetLocale = SUPPORTED_LOCALES.includes(locale)
		? locale
		: (() => {
				console.warn(
					`Unsupported locale: ${locale}. Falling back to ${DEFAULT_LOCALE}`,
				);
				return DEFAULT_LOCALE;
			})();

	if (!i18n.global.availableLocales.includes(targetLocale)) {
		i18n.global.setLocaleMessage(targetLocale, getLocaleModules(targetLocale));
	}

	// i18n.global.locale is a Ref when legacy: false
	i18n.global.locale.value = targetLocale;

	try {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, targetLocale);
	} catch (error) {
		console.warn("Failed to save locale to localStorage:", error);
	}

	document.documentElement.lang = targetLocale;
}
