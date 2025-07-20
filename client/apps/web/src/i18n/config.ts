import { createI18n } from "vue-i18n";
import { datetimeFormats } from "./formats";
import { numberFormats } from "./number-formats";
import enTranslations from "./translations/en";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
	en: { name: "English", flag: "🇺🇸" },
	es: { name: "Spanish", flag: "🇪🇸" },
};

export const DEFAULT_LANGUAGE = "en";

// Create a type for the translation messages structure
export type MessageSchema = typeof enTranslations;
export type MessageLanguages = {
	[key: string]: MessageSchema;
};

/**
 * Configure and create the Vue I18n instance
 */
export function createI18nInstance() {
	// Load default language synchronously to avoid async initialization issues
	const messages = {
		en: enTranslations,
	};

	return createI18n({
		legacy: false,
		locale: DEFAULT_LANGUAGE,
		fallbackLocale: DEFAULT_LANGUAGE,
		messages,
		datetimeFormats,
		numberFormats,
		missingWarn: process.env.NODE_ENV === "development",
		fallbackWarn: process.env.NODE_ENV === "development",
	});
}

/**
 * Set the HTML lang attribute to match the current locale
 */
export function setHtmlLang(locale: string) {
	document.documentElement.setAttribute("lang", locale);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(lang: string): boolean {
	return Object.keys(SUPPORTED_LANGUAGES).includes(lang);
}

/**
 * Get the browser's preferred language that is supported by the app
 */
export function getBrowserLanguage(): string {
	const browserLang = navigator.language?.split("-")[0];
	return isLanguageSupported(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}

/**
 * Get the stored language preference from localStorage
 */
export function getStoredLanguage(): string | null {
	return localStorage.getItem("currentLanguage");
}

/**
 * Store the language preference in localStorage
 */
export function storeLanguage(lang: string): void {
	localStorage.setItem("currentLanguage", lang);
}

/**
 * Determine the initial language to use
 */
export function determineInitialLanguage(): string {
	const storedLang = getStoredLanguage();
	if (storedLang && isLanguageSupported(storedLang)) {
		return storedLang;
	}

	return getBrowserLanguage();
}
