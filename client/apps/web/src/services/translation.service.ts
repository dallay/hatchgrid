import type { Composer, VueI18n } from "vue-i18n";

export default class TranslationService {
	private i18n: Composer | VueI18n;
	private supportedLanguages = ["en", "es", "fr", "de", "pt"];

	constructor(i18n: Composer | VueI18n) {
		this.i18n = i18n;
	}

	private isComposer(i18n: Composer | VueI18n): i18n is Composer {
		return (
			"locale" in i18n &&
			typeof i18n.locale === "object" &&
			"value" in i18n.locale
		);
	}

	async refreshTranslation(targetLanguage: string): Promise<void> {
		let languageToUse = targetLanguage;
		if (!this.isLanguageSupported(targetLanguage)) {
			console.warn(
				`Language ${targetLanguage} is not supported. Falling back to 'en'.`,
			);
			languageToUse = "en";
		}

		try {
			// Dynamic import of translation files
			const messages = await import(`../locales/${languageToUse}.json`);
			this.i18n.setLocaleMessage(languageToUse, messages.default || messages);

			if (this.isComposer(this.i18n)) {
				this.i18n.locale.value = languageToUse;
			} else {
				this.i18n.locale = languageToUse;
			}

			// Update document language attribute
			document.documentElement.lang = languageToUse;

			console.log(`Translation refreshed for language: ${languageToUse}`);
		} catch (error) {
			console.error(`Failed to load translation for ${languageToUse}:`, error);

			// Fallback to English if current language fails
			if (languageToUse !== "en") {
				await this.refreshTranslation("en");
			}
		}
	}

	setLocale(language: string): void {
		if (this.isLanguageSupported(language)) {
			if (this.isComposer(this.i18n)) {
				this.i18n.locale.value = language;
			} else {
				this.i18n.locale = language;
			}
			this.setLocalStoreLanguage(language);
			document.documentElement.lang = language;
		}
	}

	isLanguageSupported(language: string): boolean {
		return this.supportedLanguages.includes(language);
	}

	getLocalStoreLanguage(): string | null {
		return localStorage.getItem("currentLanguage");
	}

	setLocalStoreLanguage(language: string): void {
		localStorage.setItem("currentLanguage", language);
	}

	getSupportedLanguages(): string[] {
		return [...this.supportedLanguages];
	}

	getCurrentLanguage(): string {
		if (this.isComposer(this.i18n)) {
			return this.i18n.locale.value;
		}
		return this.i18n.locale;
	}

	translate(key: string, params?: Record<string, unknown>): string {
		if (this.isComposer(this.i18n)) {
			return this.i18n.t(key, params || {});
		}
		return this.i18n.t(key, params || {}) as string;
	}

	hasTranslation(key: string): boolean {
		return this.i18n.te(key);
	}
}
