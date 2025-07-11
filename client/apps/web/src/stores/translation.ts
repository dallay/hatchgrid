import { defineStore } from "pinia";

export interface TranslationState {
	currentLanguage: string;
	availableLanguages: { code: string; name: string; flag: string }[];
	isLoading: boolean;
}

export const defaultTranslationState: TranslationState = {
	currentLanguage: "en",
	availableLanguages: [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "es", name: "Español", flag: "🇪🇸" },
		{ code: "fr", name: "Français", flag: "🇫🇷" },
		{ code: "de", name: "Deutsch", flag: "🇩🇪" },
		{ code: "pt", name: "Português", flag: "🇵🇹" },
	],
	isLoading: false,
};

export const useTranslationStore = defineStore("translation", {
	state: (): TranslationState => ({ ...defaultTranslationState }),

	getters: {
		getCurrentLanguageInfo: (state) => {
			return (
				state.availableLanguages.find(
					(lang) => lang.code === state.currentLanguage,
				) || state.availableLanguages[0]
			);
		},
		isLanguageSupported: (state) => (languageCode: string) => {
			return state.availableLanguages.some(
				(lang) => lang.code === languageCode,
			);
		},
	},

	actions: {
		setCurrentLanguage(languageCode: string) {
			if (this.isLanguageSupported(languageCode)) {
				this.currentLanguage = languageCode;
				localStorage.setItem("currentLanguage", languageCode);
			} else {
				console.warn(`Language ${languageCode} is not supported`);
			}
		},

		setLoading(loading: boolean) {
			this.isLoading = loading;
		},

		loadLanguageFromStorage() {
			const storedLanguage = localStorage.getItem("currentLanguage");
			if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
				this.currentLanguage = storedLanguage;
			} else {
				// Fallback to browser language or default
				const browserLanguage = navigator.language.split("-")[0];
				this.currentLanguage = this.isLanguageSupported(browserLanguage)
					? browserLanguage
					: "en";
			}
		},

		addLanguage(language: { code: string; name: string; flag: string }) {
			if (
				!this.availableLanguages.some((lang) => lang.code === language.code)
			) {
				this.availableLanguages.push(language);
			}
		},

		removeLanguage(languageCode: string) {
			const index = this.availableLanguages.findIndex(
				(lang) => lang.code === languageCode,
			);
			if (index > -1 && languageCode !== "en") {
				// Don't allow removing English
				this.availableLanguages.splice(index, 1);

				// Switch to English if current language is being removed
				if (this.currentLanguage === languageCode) {
					this.setCurrentLanguage("en");
				}
			}
		},
	},
});
