import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslation } from "../useTranslation";

// Mock the vue-i18n module
vi.mock("vue-i18n", async () => {
	const actual = await vi.importActual("vue-i18n");
	return {
		...actual,
		useI18n: () => {
			return {
				t: (key: string) => {
					const messages: Record<string, Record<string, string>> = {
						en: {
							"common.welcome": "Welcome to our application",
						},
						es: {
							"common.welcome": "Bienvenido a nuestra aplicación",
						},
					};
					const currentLocale = "en";
					return messages[currentLocale]?.[key] || key;
				},
				d: vi.fn(),
				n: vi.fn(),
				tm: vi.fn(),
				rt: vi.fn(),
				locale: { value: "en" },
				availableLocales: ["en", "es"],
				setLocaleMessage: vi.fn(),
			};
		},
	};
});

// Mock dynamic imports
vi.mock("../i18n/translations/es.ts", () => ({
	default: {
		common: {
			welcome: "Bienvenido a nuestra aplicación",
		},
	},
}));

describe("useTranslation", () => {
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

	it("should provide translation functions", () => {
		const { t, d, n, locale } = useTranslation();

		expect(t).toBeDefined();
		expect(d).toBeDefined();
		expect(n).toBeDefined();
		expect(locale).toBeDefined();
	});

	it("should translate keys correctly", () => {
		const { t } = useTranslation();

		expect(t("common.welcome")).toBe("Welcome to our application");
	});

	it("should change language", async () => {
		const { changeLanguage, locale } = useTranslation();

		// Initial language should be English
		expect(locale.value).toBe("en");

		// Change to Spanish
		const result = await changeLanguage("es");
		expect(result).toBe(true);

		// Language should be changed
		expect(locale.value).toBe("es");

		// HTML lang attribute should be updated
		expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
			"lang",
			"es",
		);

		// localStorage should be updated
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			"currentLanguage",
			"es",
		);
	});

	it("should handle unsupported languages gracefully", async () => {
		const { changeLanguage, locale } = useTranslation();

		// Mock the implementation to simulate failure
		vi.spyOn(locale, "value", "get").mockReturnValue("en");

		// Mock the dynamic import to throw an error for fr.ts
		vi.mock("../i18n/translations/fr.ts", () => {
			throw new Error("Module not found");
		});

		// Try to change to an unsupported language
		const result = await changeLanguage("fr");

		// Should return false indicating failure
		expect(result).toBe(false);

		// Language should remain as English
		expect(locale.value).toBe("en");
	});
});
