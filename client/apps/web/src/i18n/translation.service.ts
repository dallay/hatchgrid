import axios from "axios";
import type { Composer } from "vue-i18n";
import languages from "@/i18n/languages.ts";

export default class TranslationService {
	private readonly i18n: Composer;
	private languages = languages();

	constructor(i18n: Composer) {
		this.i18n = i18n;
	}

	async refreshTranslation(newLanguage: string) {
		const messages = this.i18n.messages as Record<string, any>;
		if (this.i18n && !messages[newLanguage]) {
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
