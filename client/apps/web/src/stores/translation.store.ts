import { defineStore } from "pinia";

interface TranslationState {
	currentLanguage: string | undefined;
}

export const useTranslationStore = defineStore("translationStore", {
	state: (): TranslationState => ({
		currentLanguage: undefined,
	}),
	actions: {
		setCurrentLanguage(newLanguage: string | undefined) {
			this.currentLanguage = newLanguage;
			if (typeof newLanguage === "string") {
				localStorage.setItem("currentLanguage", newLanguage);
			} else {
				localStorage.removeItem("currentLanguage");
			}
		},
	},
});
