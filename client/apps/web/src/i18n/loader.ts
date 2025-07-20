import type { I18n } from "vue-i18n";
import { useTranslationStore } from "@/stores/translation.store";
import { DEFAULT_LANGUAGE } from "./constants";
import en from "./en/en.js";

// Cache for loaded languages to avoid redundant network requests
const loadedLanguages: Set<string> = new Set();

/**
 * Sets the application's locale and updates necessary attributes.
 * @param i18n - The I18n instance.
 * @param language - The language code to set.
 */
function setLanguage(i18n: I18n, language: string): void {
	const translationStore = useTranslationStore();

	i18n.global.locale.value = language;
	translationStore.setCurrentLanguage(language);

	// Update the HTML lang attribute
	document.querySelector("html")?.setAttribute("lang", language);
}

/**
 * Loads the default language translations synchronously.
 * @param i18n - The I18n instance.
 */
function loadDefaultLanguage(i18n: I18n): void {
	i18n.global.setLocaleMessage(DEFAULT_LANGUAGE, en);
	loadedLanguages.add(DEFAULT_LANGUAGE);
}

/**
 * Asynchronously loads translation messages for a given language.
 * Caches loaded languages to prevent redundant fetches.
 *
 * @param language - The language code to load.
 * @returns The loaded translation messages.
 * @throws If the language is not supported or translations fail to load.
 */
async function loadLanguageAsync(language: string, retries = 3) {
	if (loadedLanguages.has(language)) {
		return;
	}

	for (let i = 0; i < retries; i++) {
		try {
			const messages = (await import(`./${language}/${language}.js`)).default;
			loadedLanguages.add(language);
			return messages;
		} catch (error) {
			console.error(
				`Failed to load language: ${language}, attempt ${i + 1}`,
				error,
			);
			if (i === retries - 1) {
				throw new Error(`Could not load translations for ${language}.`);
			}
		}
	}
}

/**
 * Switches the application's language.
 * It ensures the default language is loaded and then loads the target language if needed.
 *
 * @param i18n - The I18n instance.
 * @param language - The new language code.
 */
export async function switchLanguage(
	i18n: I18n,
	language: string,
): Promise<void> {
	const translationStore = useTranslationStore();
	translationStore.setLoading(true);

	try {
		// Ensure the default language is always available
		if (!loadedLanguages.has(DEFAULT_LANGUAGE)) {
			loadDefaultLanguage(i18n);
		}

		const messages = await loadLanguageAsync(language);
		if (messages) {
			i18n.global.setLocaleMessage(language, messages);
		}

		setLanguage(i18n, language);
	} catch (error) {
		console.error(`Failed to switch to language: ${language}`, error);
		// Fallback to default language if the new one fails
		setLanguage(i18n, DEFAULT_LANGUAGE);
	} finally {
		translationStore.setLoading(false);
	}
}

/**
 * Initializes the translation system.
 * It loads the default language and the user's preferred language from the store.
 *
 * @param i18n - The I18n instance.
 */
export async function initTranslations(i18n: I18n): Promise<void> {
	const translationStore = useTranslationStore();
	loadDefaultLanguage(i18n);

	const targetLanguage = translationStore.currentLanguage ?? DEFAULT_LANGUAGE;

	if (targetLanguage !== DEFAULT_LANGUAGE) {
		await switchLanguage(i18n, targetLanguage);
	} else {
		setLanguage(i18n, DEFAULT_LANGUAGE);
	}
}
