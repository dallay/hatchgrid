import axios from "axios";
import type { Composer } from "vue-i18n";
import languages from "@/i18n/languages.ts";

// Define a more flexible type that can work with both the real Composer and our mock
export type I18nLike = {
	locale: { value: string };
	messages: { value: Record<string, unknown> };
	setLocaleMessage: (lang: string, messages: Record<string, unknown>) => void;
};

/**
 * Type definition for the Vue I18n global instance
 * This is a simplified version that only includes the properties we need
 */
interface I18nGlobalLike {
	locale: string | { value: string };
	messages:
		| { value: Record<string, unknown> }
		| (() => Record<string, unknown>);
	setLocaleMessage?: (lang: string, messages: Record<string, unknown>) => void;
}

/**
 * Creates an adapter that converts a Vue I18n global instance to our I18nLike interface
 * @param i18nGlobal The Vue I18n global instance (either Composer or VueI18n)
 * @returns An object that implements I18nLike interface
 */
export function createI18nAdapter(i18nGlobal: unknown): I18nLike {
	// Check if it's already compatible with I18nLike
	if (isI18nLike(i18nGlobal)) {
		return i18nGlobal;
	}

	// Type assertion - we'll handle potential errors in the getters/setters
	const i18n = i18nGlobal as Partial<I18nGlobalLike>;

	// Create an adapter that wraps the Vue I18n global instance
	return {
		locale: {
			get value() {
				if (!i18n.locale) {
					return "en"; // Default fallback
				}
				return typeof i18n.locale === "string"
					? i18n.locale
					: i18n.locale.value;
			},
			set value(val: string) {
				if (!i18n.locale) {
					console.warn("Cannot set locale: i18n.locale is undefined");
					return;
				}
				if (typeof i18n.locale === "string") {
					// Use a type assertion with a more specific type
					(i18n as { locale: string }).locale = val;
				} else {
					i18n.locale.value = val;
				}
			},
		},
		messages: {
			get value() {
				if (!i18n.messages) {
					return {}; // Default empty messages
				}
				return typeof i18n.messages === "function"
					? i18n.messages()
					: i18n.messages.value || {};
			},
		},
		setLocaleMessage(lang: string, messages: Record<string, unknown>) {
			if (typeof i18n.setLocaleMessage === "function") {
				i18n.setLocaleMessage(lang, messages);
			} else {
				console.warn("setLocaleMessage is not available on the i18n instance");
			}
		},
	};
}

/**
 * Type guard function to check if an object conforms to the I18nLike interface
 * @param obj The object to check
 * @returns True if the object implements I18nLike interface
 */
export function isI18nLike(obj: unknown): obj is I18nLike {
	if (!obj || typeof obj !== "object") {
		return false;
	}

	const candidate = obj as Partial<I18nLike>;

	// Check if locale exists and has a value property of type string
	const hasValidLocale =
		candidate.locale !== undefined &&
		typeof candidate.locale === "object" &&
		candidate.locale !== null &&
		"value" in candidate.locale &&
		typeof candidate.locale.value === "string";

	// Check if messages exists and has a value property that is an object
	const hasValidMessages =
		candidate.messages !== undefined &&
		typeof candidate.messages === "object" &&
		candidate.messages !== null &&
		"value" in candidate.messages &&
		typeof candidate.messages.value === "object" &&
		candidate.messages.value !== null;

	// Check if setLocaleMessage is a function
	const hasValidSetLocaleMessage =
		candidate.setLocaleMessage !== undefined &&
		typeof candidate.setLocaleMessage === "function";

	return hasValidLocale && hasValidMessages && hasValidSetLocaleMessage;
}

export default class TranslationService {
	private readonly i18n: I18nLike;
	private readonly languages = languages();

	constructor(i18n: I18nLike | Composer) {
		// Validate that the input conforms to I18nLike interface
		if (!isI18nLike(i18n)) {
			throw new Error(
				"Invalid i18n instance provided. The object does not implement the required I18nLike interface.",
			);
		}
		this.i18n = i18n;
	}

	async refreshTranslation(newLanguage: string) {
		try {
			// Check if the language is already loaded
			const hasLanguage = Object.hasOwn(this.i18n.messages.value, newLanguage);

			if (!hasLanguage) {
				const translations = (
					await import(`../i18n/${newLanguage}/${newLanguage}.js`)
				).default;

				if (!translations || typeof translations !== "object") {
					throw new Error(
						`Invalid translation format for language: ${newLanguage}`,
					);
				}

				this.i18n.setLocaleMessage(newLanguage, translations);
			}
		} catch (error) {
			console.error(
				`Failed to load translations for language: ${newLanguage}`,
				error,
			);
			throw new Error(
				`Failed to load translations for language: ${newLanguage}`,
			);
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
		// Since we validate i18n in the constructor, this should always be safe
		// but we still use optional chaining as a defensive measure
		return this.i18n?.locale?.value ?? this.getLocalStoreLanguage() ?? "en";
	}
}
