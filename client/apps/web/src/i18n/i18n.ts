import { useTranslationStore } from "@/stores/translation.store";
import { DEFAULT_LOCALE, type Lang } from "./types";

/**
 * Retrieves the translation for a given key.
 *
 * @param lang - The current language.
 * @returns - The translation function.
 */
export function useTranslations(lang: Lang) {
	const translationStore = useTranslationStore();

	return function t(
		key: string,
		variables?: Record<string, string | number>,
	): string {
		const translation = translationStore.getTranslation(lang, key) ?? key;

		if (variables) {
			return Object.entries(variables).reduce((result, [varKey, value]) => {
				return result.replace(new RegExp(`{${varKey}}`, "g"), String(value));
			}, translation);
		}

		return translation;
	};
}

/**
 * Translates a path to the specified language.
 *
 * @param lang - The current language.
 * @returns - A function that translates a path.
 */
export function useTranslatedPath(lang: Lang) {
	return function translatePath(path: string, targetLang: Lang = lang): string {
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		const langPrefixRegex = new RegExp(`^/${targetLang}/`);

		if (langPrefixRegex.test(normalizedPath)) {
			return normalizedPath;
		}

		if (targetLang === DEFAULT_LOCALE) {
			return normalizedPath;
		}

		return `/${targetLang}${normalizedPath}`;
	};
}
