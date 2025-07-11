import { createI18n, type I18nOptions } from "vue-i18n";

// Import translation files
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const messages = {
	en,
	es,
};

export const i18nConfig: I18nOptions = {
	locale: "en", // Default locale
	fallbackLocale: "en",
	messages,
	legacy: false, // Use Composition API
	globalInjection: true, // Enable global injection for $t
};

export const i18n = createI18n(i18nConfig);
