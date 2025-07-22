import { deepmerge } from "@hatchgrid/utilities";

/**
 * In-memory cache for merged locale message objects.
 * Prevents redundant file system reads and merges for previously loaded locales.
 * @type {Record<string, object>}
 */
const localeCache: Record<string, object> = {};

/**
 * Loads and merges all JSON message files for a given locale.
 * Utilizes caching to avoid repeated file system access and merging.
 * Vite's import.meta.glob only accepts string literals, so use a conditional.
 *
 * @param {string} locale - The locale code (e.g., 'en', 'es').
 * @returns {object} - The merged locale messages object. Returns an empty object if locale is not found.
 */
export function getLocaleModules(locale: string): object {
	if (localeCache[locale]) return localeCache[locale];

	const modules = import.meta.glob("./locales/**/*.json", { eager: true });
	console.log("Modules:", modules);

	const messages = Object.entries(modules).reduce((acc, [path, module]) => {
		if (path.includes(`/locales/${locale}/`)) {
			console.log("Adding module:", path, module);
			acc.push((module as { default: object }).default);
		}
		return acc;
	}, [] as object[]);

	console.log("Messages to merge:", messages);

	if (messages.length === 0) return {};

	const result = deepmerge.all(messages);
	console.log("Merged result:", result);

	localeCache[locale] = result;
	return result;
}
