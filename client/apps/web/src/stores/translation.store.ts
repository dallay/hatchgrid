import { defineStore } from "pinia";
import { DEFAULT_LOCALE, type Lang } from "@/i18n/types";

interface TranslationState {
	translations: Record<Lang, Record<string, string>>;
	currentLanguage: Lang;
}

export const useTranslationStore = defineStore("translation", {
	state: (): TranslationState => ({
		translations: {
			en: {},
			es: {},
		},
		currentLanguage: DEFAULT_LOCALE,
	}),
	actions: {
		setTranslations(lang: Lang, newTranslations: Record<string, string>) {
			this.translations[lang] = newTranslations;
		},
		setCurrentLanguage(lang: Lang) {
			this.currentLanguage = lang;
		},
		getTranslation(lang: Lang, key: string): string | undefined {
			return this.translations[lang]?.[key];
		},
	},
});
