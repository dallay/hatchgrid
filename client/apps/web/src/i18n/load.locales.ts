import { deepmerge } from "@hatchgrid/utilities";

// Define proper types for i18n messages
export type LocaleMessages = Record<string, unknown>;

/**
 * In-memory cache for merged locale message objects.
 * Prevents redundant file system reads and merges for previously loaded locales.
 */
const localeCache: Record<string, LocaleMessages> = {};

/**
 * Loads and merges all JSON message files for a given locale.
 * Utilizes caching to avoid repeated file system access and merging.
 * Vite's import.meta.glob only accepts string literals, so use a conditional.
 *
 * @param locale - The locale code (e.g., 'en', 'es').
 * @returns The merged locale messages object. Returns an empty object if locale is not found.
 */
export function getLocaleModules(locale: string): LocaleMessages {
	if (localeCache[locale]) return localeCache[locale];

	const modules = import.meta.glob("./locales/**/*.json", { eager: true });

	const messages = Object.entries(modules).reduce((acc, [path, module]) => {
		if (path.includes(`/locales/${locale}/`)) {
			acc.push((module as { default: LocaleMessages }).default);
		}
		return acc;
	}, [] as LocaleMessages[]);

	if (messages.length === 0) return {};

	const result = deepmerge.all(messages) as LocaleMessages;

	localeCache[locale] = result;
	return result;
}
