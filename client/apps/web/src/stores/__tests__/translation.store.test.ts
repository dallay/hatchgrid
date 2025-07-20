import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useTranslationStore, DEFAULT_LANGUAGE } from "../translation.store";

describe("translation.store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		const store = useTranslationStore();
		store.currentLanguage = DEFAULT_LANGUAGE;
		store.isLoading = false;
		localStorage.clear();
	});

	it("should initialize with default language", () => {
		const store = useTranslationStore();
		expect(store.currentLanguage).toBe(DEFAULT_LANGUAGE);
	});

	it("setCurrentLanguage sets the language", () => {
		const store = useTranslationStore();
		store.setCurrentLanguage("es");
		expect(store.currentLanguage).toBe("es");
	});
});
