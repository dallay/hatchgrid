import { useI18n } from "vue-i18n";
import { switchLanguage as switchLang } from "@/i18n/loader";
import type { TranslationKey } from "@/types/i18n";

/**
 * A custom composable for handling translations with type safety.
 *
 * @returns An object with functions for translation, and language switching.
 */
export function useTranslation() {
	const i18n = useI18n();

	/**
	 * Switches the application's language.
	 *
	 * @param language - The new language code to switch to.
	 */
	const switchLanguage = async (language: string) => {
		await switchLang(i18n, language);
	};

	/**
	 * Type-safe translation function.
	 *
	 * @param key - The translation key.
	 * @param params - Optional parameters for the translation.
	 * @returns The translated string.
	 */
	const t = (key: TranslationKey, params?: Record<string, unknown>) => {
		return i18n.t(key, params);
	};

	return {
		t,
		d: i18n.d,
		n: i18n.n,
		locale: i18n.locale,
		switchLanguage,
	};
}
