import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslationStore } from "../translation";

const mockLanguages = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "es", name: "Español", flag: "🇪🇸" },
	{ code: "fr", name: "Français", flag: "🇫🇷" },
	{ code: "de", name: "Deutsch", flag: "🇩🇪" },
	{ code: "it", name: "Italiano", flag: "🇮🇹" },
];

vi.mock("../translation", async () => {
	const actual = await vi.importActual("../translation");
	return {
		...actual,
		useTranslationStore: () => {
			const store = actual.useTranslationStore();
			store.availableLanguages = [...mockLanguages];
			return store;
		},
	};
});

describe("Translation Store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal("localStorage", {
			getItem: vi.fn(),
			setItem: vi.fn(),
		});
		vi.stubGlobal("navigator", {
			language: "en-US",
		});
	});

	it("should initialize with default state", () => {
		const store = useTranslationStore();
		expect(store.currentLanguage).toBe("en");
		expect(store.isLoading).toBe(false);
		expect(store.availableLanguages).toHaveLength(5);
	});

	it("should get current language info", () => {
		const store = useTranslationStore();
		expect(store.getCurrentLanguageInfo).toEqual({
			code: "en",
			name: "English",
			flag: "🇺🇸",
		});
	});

	it("should check if language is supported", () => {
		const store = useTranslationStore();
		expect(store.isLanguageSupported("en")).toBe(true);
		expect(store.isLanguageSupported("xx")).toBe(false);
	});

	it("should set current language if supported", () => {
		const store = useTranslationStore();
		store.setCurrentLanguage("es");
		expect(store.currentLanguage).toBe("es");
		expect(localStorage.setItem).toHaveBeenCalledWith("currentLanguage", "es");
	});

	it("should not set current language if unsupported", () => {
		const store = useTranslationStore();
		const consoleSpy = vi.spyOn(console, "warn");
		store.setCurrentLanguage("xx");
		expect(store.currentLanguage).toBe("en");
		expect(consoleSpy).toHaveBeenCalledWith("Language xx is not supported");
	});

	it("should set loading state", () => {
		const store = useTranslationStore();
		store.setLoading(true);
		expect(store.isLoading).toBe(true);
	});

	it("should load language from storage", () => {
		vi.mocked(localStorage.getItem).mockReturnValue("es");
		const store = useTranslationStore();
		store.loadLanguageFromStorage();
		expect(store.currentLanguage).toBe("es");
	});

	it("should fall back to browser language if stored language invalid", () => {
		vi.mocked(localStorage.getItem).mockReturnValue("xx");
		vi.stubGlobal("navigator", { language: "es-ES" });
		const store = useTranslationStore();
		store.loadLanguageFromStorage();
		expect(store.currentLanguage).toBe("es");
	});

	it("should add new language if not exists", () => {
		const store = useTranslationStore();
		const newLang = { code: "pt", name: "Português", flag: "🇵🇹" };
		store.addLanguage(newLang);
		expect(store.availableLanguages).toContainEqual(newLang);
	});

	it("should not add duplicate language", () => {
		const store = useTranslationStore();
		const initialLength = store.availableLanguages.length;
		store.addLanguage({ code: "en", name: "English", flag: "🇺🇸" });
		expect(store.availableLanguages).toHaveLength(initialLength);
	});

	it("should remove language if not English", () => {
		const store = useTranslationStore();
		store.removeLanguage("es");
		expect(store.availableLanguages.some((lang) => lang.code === "es")).toBe(
			false,
		);
	});

	it("should not remove English language", () => {
		const store = useTranslationStore();
		store.removeLanguage("en");
		expect(store.availableLanguages.some((lang) => lang.code === "en")).toBe(
			true,
		);
	});

	it("should switch to English when removing current language", () => {
		const store = useTranslationStore();
		store.setCurrentLanguage("es");
		store.removeLanguage("es");
		expect(store.currentLanguage).toBe("en");
	});
});
