import { useI18n } from "vue-i18n";
import type { MessageSchema } from "@/i18n/config";

/**
 * Type-safe wrapper around Vue I18n's useI18n composable
 */
export function useTranslation() {
	const { t, d, n, tm, rt, locale, availableLocales } = useI18n({
		useScope: "global",
	});

	/**
	 * Type-safe translation function
	 */
	const translate = t as (
		key: keyof MessageSchema | string,
		...args: unknown[]
	) => string;

	/**
	 * Change the current language
	 */
	const changeLanguage = async (newLocale: string) => {
		// Only load the language if it's not the current one
		if (newLocale !== locale.value) {
			try {
				// Dynamic import for the requested language
				if (newLocale !== "en") {
					const module = await import(`../i18n/translations/${newLocale}.ts`);
					const i18n = useI18n();
					i18n.setLocaleMessage(newLocale, module.default);
				}

				// Update the locale
				locale.value = newLocale;

				// Update HTML lang attribute
				document.documentElement.setAttribute("lang", newLocale);

				// Store the preference
				localStorage.setItem("currentLanguage", newLocale);

				return true;
			} catch (error) {
				console.error(`Failed to load language: ${newLocale}`, error);
				return false;
			}
		}

		return true;
	};

	return {
		t: translate,
		d,
		n,
		tm,
		rt,
		locale,
		availableLocales,
		changeLanguage,
	};
}
