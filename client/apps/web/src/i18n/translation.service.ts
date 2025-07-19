import axios from "axios";
import type { Composer } from "vue-i18n";
import languages from "@/i18n/languages.ts";

// Define a more flexible type that can work with both the real Composer and our mock
export type I18nLike = {
	locale: { value: string };
	messages: { value: Record<string, unknown> };
	setLocaleMessage: (lang: string, messages: Record<string, unknown>) => void;
};

export default class TranslationService {
	private readonly i18n: I18nLike;
	private readonly languages = languages();

	constructor(i18n: I18nLike | Composer) {
		this.i18n = i18n as I18nLike;
	}

	async refreshTranslation(newLanguage: string) {
		// Check if the language is already loaded
		const hasLanguage = Object.hasOwn(this.i18n.messages.value, newLanguage);

		if (!hasLanguage) {
			const translations = (
				await import(`../i18n/${newLanguage}/${newLanguage}.js`)
			).default;
			this.i18n.setLocaleMessage(newLanguage, translations);
		}
	}

	setLocale(lang: string) {
		this.i18n.locale.value = lang;
		axios.defaults.headers.common["Accept-Language"] = lang;
		const htmlElement = document.querySelector("html");
		if (htmlElement) {
			htmlElement.setAttribute("lang", lang);
		}
	}

	isLanguageSupported(lang: string) {
		return Boolean(this.languages[lang]);
	}

	getLocalStoreLanguage(): string | null {
		return localStorage.getItem("currentLanguage");
	}

	getCurrentLanguage(): string {
		// Return the current language from i18n, falling back to localStorage or 'en'
		if (this.i18n?.locale?.value) {
			return this.i18n.locale.value;
		}
		return this.getLocalStoreLanguage() || "en";
	}
}
