import { createI18n } from "vue-i18n";
import { DEFAULT_LANGUAGE } from "@/i18n/constants";
import { datetimeFormats, numberFormats } from "@/i18n/formats";
import { useTranslationStore } from "@/stores/translation.store";

/**
 * Initializes and configures the Vue I18n instance.
 *
 * This setup includes:
 * - Legacy mode disabled for Composition API support.
 * - Locale and fallback locale settings.
 * - Handling for missing translations.
 * - Pre-defined number and date/time formats.
 *
 * @returns The configured Vue I18n instance.
 */
export function setupI18n() {
	const translationStore = useTranslationStore();
	const locale = translationStore.currentLanguage ?? DEFAULT_LANGUAGE;

	return createI18n({
		legacy: false,
		locale,
		fallbackLocale: DEFAULT_LANGUAGE,
		missing: (locale, key) => {
			console.warn(`Missing translation key: "${key}" for locale: "${locale}"`);
			return key;
		},
		numberFormats,
		datetimeFormats,
	});
}
