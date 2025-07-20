import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createI18nInstance,
	DEFAULT_LANGUAGE,
	determineInitialLanguage,
	getStoredLanguage,
	isLanguageSupported,
	setHtmlLang,
} from "../config";

describe("i18n configuration", () => {
	// Mock localStorage
	const localStorageMock = (() => {
		let store: Record<string, string> = {};
		return {
			getItem: vi.fn((key: string) => store[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			clear: vi.fn(() => {
				store = {};
			}),
		};
	})();

	// Replace the global localStorage with our mock
	Object.defineProperty(window, "localStorage", {
		value: localStorageMock,
	});

	beforeEach(() => {
		// Clear localStorage before each test
		localStorageMock.clear();

		// Reset all mocks
		vi.clearAllMocks();

		// Mock document.documentElement
		Object.defineProperty(document, "documentElement", {
			value: {
				setAttribute: vi.fn(),
				getAttribute: vi.fn(),
			},
			writable: true,
		});
	});

	describe("createI18nInstance", () => {
		it("should create an i18n instance with default language", () => {
			const i18n = createI18nInstance();
			expect(i18n).toBeDefined();
			expect(i18n.global.locale.value).toBe(DEFAULT_LANGUAGE);
			expect(i18n.global.availableLocales).toContain(DEFAULT_LANGUAGE);
		});

		it("should have English translations loaded by default", () => {
			const i18n = createI18nInstance();
			const messages = i18n.global.getLocaleMessage(DEFAULT_LANGUAGE);
			expect(messages).toBeDefined();
			expect(messages.common).toBeDefined();
			expect(messages.common.welcome).toBeDefined();
		});
	});

	describe("isLanguageSupported", () => {
		it("should return true for supported languages", () => {
			expect(isLanguageSupported("en")).toBe(true);
			expect(isLanguageSupported("es")).toBe(true);
		});

		it("should return false for unsupported languages", () => {
			expect(isLanguageSupported("fr")).toBe(false);
			expect(isLanguageSupported("de")).toBe(false);
		});
	});

	describe("getStoredLanguage", () => {
		it("should return null when no language is stored", () => {
			expect(getStoredLanguage()).toBeNull();
		});

		it("should return the stored language", () => {
			// Set up the mock to return 'es'
			localStorageMock.setItem("currentLanguage", "es");

			expect(getStoredLanguage()).toBe("es");
		});
	});

	describe("setHtmlLang", () => {
		it("should set the lang attribute on the html element", () => {
			setHtmlLang("es");
			expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
				"lang",
				"es",
			);
		});
	});

	describe("determineInitialLanguage", () => {
		it("should return the stored language if available", () => {
			// Set up the mock to return 'es'
			localStorageMock.setItem("currentLanguage", "es");

			expect(determineInitialLanguage()).toBe("es");
		});

		it("should return the browser language if supported and no stored language", () => {
			// Mock navigator.language
			Object.defineProperty(navigator, "language", {
				value: "es",
				writable: true,
			});

			expect(determineInitialLanguage()).toBe("es");
		});

		it("should return the default language if neither stored nor browser language is supported", () => {
			// Mock navigator.language
			Object.defineProperty(navigator, "language", {
				value: "fr",
				writable: true,
			});

			expect(determineInitialLanguage()).toBe(DEFAULT_LANGUAGE);
		});
	});
});
