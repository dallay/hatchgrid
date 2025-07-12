import { useRoute } from "vue-router";
import {
	DEFAULT_LOCALE,
	type Lang,
	LOCALES,
	SHOW_DEFAULT_LANG_IN_URL,
} from "./locales";

/**
 * Helper to translate paths between languages
 * @param lang - The current language
 * @returns - A function that translates paths
 *
 * @example
 * const translatePath = useTranslatedPath('en');
 * translatePath('/about'); // returns '/about' if en is default and SHOW_DEFAULT_LANG_IN_URL is false
 * translatePath('/about', 'es'); // returns '/es/about'
 */
export function useTranslatedPath() {
	const route = useRoute();

	return function translatePath(
		path: string,
		targetLang: Lang = (route.params.lang as Lang) || DEFAULT_LOCALE,
	): string {
		// Ensure path starts with a slash
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;

		// Get the current language from the route params, or use default
		const currentLang = (route.params.lang as Lang) || DEFAULT_LOCALE;

		// Remove current language prefix if it exists
		let pathWithoutLang = normalizedPath;
		if (currentLang !== DEFAULT_LOCALE || SHOW_DEFAULT_LANG_IN_URL) {
			const langPrefixRegex = new RegExp(`^/${currentLang}`);
			pathWithoutLang = normalizedPath.replace(langPrefixRegex, "");
		}

		// Add target language prefix if necessary
		if (targetLang === DEFAULT_LOCALE && !SHOW_DEFAULT_LANG_IN_URL) {
			return pathWithoutLang || "/"; // Return root if path is empty after removing prefix
		}
		return `/${targetLang}${pathWithoutLang}`;
	};
}

/**
 * Generates an array of locale paths for different languages based on a given URL.
 * This is primarily for language switchers.
 *
 * @param currentPath - The current path to transform
 * @returns An array of objects containing language code and localized path
 */
export function getLocalePaths(
	currentPath: string,
): { lang: Lang; path: string }[] {
	const paths: { lang: Lang; path: string }[] = [];
	const currentLang = (useRoute().params.lang as Lang) || DEFAULT_LOCALE;

	// Remove current language prefix from the path
	let pathWithoutLang = currentPath;
	if (currentLang !== DEFAULT_LOCALE || SHOW_DEFAULT_LANG_IN_URL) {
		const langPrefixRegex = new RegExp(`^/${currentLang}`);
		pathWithoutLang = currentPath.replace(langPrefixRegex, "");
	}

	// Ensure it starts with a slash and is not empty
	const cleanPath = pathWithoutLang.startsWith("/")
		? pathWithoutLang
		: `/${pathWithoutLang}`;

	for (const lang in LOCALES) {
		if (Object.hasOwn(LOCALES, lang)) {
			const targetLang = lang as Lang;
			let newPath = cleanPath;

			// Add target language prefix if necessary
			if (targetLang === DEFAULT_LOCALE && !SHOW_DEFAULT_LANG_IN_URL) {
				// No prefix for default language if SHOW_DEFAULT_LANG_IN_URL is false
				newPath = newPath || "/";
			} else {
				newPath = `/${targetLang}${newPath}`;
			}
			paths.push({ lang: targetLang, path: newPath });
		}
	}
	return paths;
}
