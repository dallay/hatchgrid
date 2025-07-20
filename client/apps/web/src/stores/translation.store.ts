import { defineStore } from "pinia";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/constants";

export interface TranslationState {
	currentLanguage: string;
	isLoading: boolean;
}

export const useTranslationStore = defineStore("translation", {
	state: (): TranslationState => ({
		currentLanguage: DEFAULT_LANGUAGE,
		isLoading: false,
	}),

	getters: {
		supportedLanguages: () => SUPPORTED_LANGUAGES,
		isLanguageSupported: () => (languageCode: string) => {
			return SUPPORTED_LANGUAGES.some((lang) => lang.code === languageCode);
		},
	},

	actions: {
		setCurrentLanguage(newLanguage: string) {
			if (this.isLanguageSupported(newLanguage)) {
				this.currentLanguage = newLanguage;
				localStorage.setItem("currentLanguage", newLanguage);
			} else {
				console.warn(`Language ${newLanguage} is not supported.`);
			}
		},

		setLoading(loading: boolean) {
			this.isLoading = loading;
		},

		loadLanguageFromStorage() {
			const storedLanguage = localStorage.getItem("currentLanguage");
			if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
				this.currentLanguage = storedLanguage;
				return;
			}

			const browserLanguage = navigator.language?.split("-")[0];
			if (browserLanguage && this.isLanguageSupported(browserLanguage)) {
				this.currentLanguage = browserLanguage;
				return;
			}

			this.currentLanguage = DEFAULT_LANGUAGE;
		},
	},
});
