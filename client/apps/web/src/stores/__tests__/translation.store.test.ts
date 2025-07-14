import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	defaultTranslationState,
	useTranslationStore,
} from "../translation.store";

describe("translation.store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	it("should initialize with default state", () => {
		const store = useTranslationStore();
		expect(store.currentLanguage).toBeUndefined();
		expect(store.availableLanguages).toEqual(
			defaultTranslationState.availableLanguages,
		);
		expect(store.isLoading).toBe(false);
	});

	it("getCurrentLanguageInfo returns correct language info", () => {
		const store = useTranslationStore();
		store.currentLanguage = "es";
		expect(store.getCurrentLanguageInfo).toEqual({
			code: "es",
			name: "Español",
			flag: "🇪🇸",
		});
		store.currentLanguage = "fr";
		expect(store.getCurrentLanguageInfo).toEqual({
			code: "en",
			name: "English",
			flag: "🇺🇸",
		});
	});

	it("isLanguageSupported returns true for supported languages", () => {
		const store = useTranslationStore();
		expect(store.isLanguageSupported("en")).toBe(true);
		expect(store.isLanguageSupported("es")).toBe(true);
		expect(store.isLanguageSupported("fr")).toBe(false);
	});

	it("setCurrentLanguage sets and persists supported language", () => {
		const store = useTranslationStore();
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");
		store.setCurrentLanguage("es");
		expect(store.currentLanguage).toBe("es");
		expect(setItemSpy).toHaveBeenCalledWith("currentLanguage", "es");
	});

	it("setCurrentLanguage warns and does not set unsupported language", () => {
		const store = useTranslationStore();
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		store.setCurrentLanguage("fr");
		expect(store.currentLanguage).toBeUndefined();
		expect(warnSpy).toHaveBeenCalledWith("Language fr is not supported");
	});

	it("setCurrentLanguage removes language when undefined", () => {
		const store = useTranslationStore();
		const removeItemSpy = vi.spyOn(window.localStorage, "removeItem");
		store.setCurrentLanguage(undefined);
		expect(store.currentLanguage).toBeUndefined();
		expect(removeItemSpy).toHaveBeenCalledWith("currentLanguage");
	});

	it("setLoading updates isLoading", () => {
		const store = useTranslationStore();
		store.setLoading(true);
		expect(store.isLoading).toBe(true);
		store.setLoading(false);
		expect(store.isLoading).toBe(false);
	});

	it("loadLanguageFromStorage loads supported language from localStorage", () => {
		const store = useTranslationStore();
		vi.spyOn(window.localStorage, "getItem").mockReturnValue("es");
		store.loadLanguageFromStorage();
		expect(store.currentLanguage).toBe("es");
	});

	it("loadLanguageFromStorage falls back to browser language or default", () => {
		const store = useTranslationStore();
		vi.spyOn(window.localStorage, "getItem").mockReturnValue(null);
		Object.defineProperty(window.navigator, "language", {
			value: "es-ES",
			configurable: true,
		});
		store.loadLanguageFromStorage();
		expect(store.currentLanguage).toBe("es");

		Object.defineProperty(window.navigator, "language", {
			value: "fr-FR",
			configurable: true,
		});
		store.loadLanguageFromStorage();
		expect(store.currentLanguage).toBe("en");
	});

	it("addLanguage adds a new language if not present", () => {
		const store = useTranslationStore();
		store.addLanguage({ code: "fr", name: "Français", flag: "🇫🇷" });
		expect(store.availableLanguages.some((l) => l.code === "fr")).toBe(true);
	});

	it("addLanguage does not add duplicate language", () => {
		const store = useTranslationStore();
		const initialLength = store.availableLanguages.length;
		store.addLanguage({ code: "en", name: "English", flag: "🇺🇸" });
		expect(store.availableLanguages.length).toBe(initialLength);
	});

	it("removeLanguage removes language except English", () => {
		const store = useTranslationStore();
		store.addLanguage({ code: "fr", name: "Français", flag: "🇫🇷" });
		store.setCurrentLanguage("fr");
		store.removeLanguage("fr");
		expect(store.availableLanguages.some((l) => l.code === "fr")).toBe(false);
		expect(store.currentLanguage).toBe("en");
	});

	it("removeLanguage does not remove English", () => {
		const store = useTranslationStore();
		store.removeLanguage("en");
		expect(store.availableLanguages.some((l) => l.code === "en")).toBe(true);
	});
});
