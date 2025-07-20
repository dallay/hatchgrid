import { createPinia } from "pinia";
import { createApp } from "vue";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import { InitializationService } from "@/services/initialization.service";
import {
	createI18nInstance,
	DEFAULT_LANGUAGE,
	determineInitialLanguage,
	setHtmlLang,
} from "./i18n/config";
import { useTranslationStore } from "./stores/translation.store.ts";
import "./style.css";
import App from "./App.vue";
import router from "./router";

/// <reference types="unplugin-icons/types/vue" />

async function bootstrap() {
	const app = createApp(App);
	const pinia = createPinia();
	app.use(pinia);

	// --- Start Language Initialization ---

	// 1. Determine initial language
	const translationStore = useTranslationStore();
	translationStore.loadLanguageFromStorage();
	const initialLanguage =
		translationStore.currentLanguage ?? determineInitialLanguage();

	// 2. Create i18n instance with default language loaded synchronously
	const i18n = createI18nInstance();

	// 3. Set the initial language
	i18n.global.locale.value = initialLanguage;
	setHtmlLang(initialLanguage);

	// 4. Load non-default language if needed
	if (initialLanguage !== DEFAULT_LANGUAGE) {
		try {
			const module = await import(`./i18n/translations/${initialLanguage}.ts`);
			i18n.global.setLocaleMessage(initialLanguage, module.default);
			console.log(`Successfully loaded language: ${initialLanguage}`);
		} catch (error) {
			console.error(
				`Failed to load language '${initialLanguage}', using default.`,
				error,
			);
			i18n.global.locale.value = DEFAULT_LANGUAGE;
			setHtmlLang(DEFAULT_LANGUAGE);
			translationStore.setCurrentLanguage(DEFAULT_LANGUAGE);
		}
	}
	// --- End Language Initialization ---

	// Register plugins
	app.use(router);
	app.use(i18n);

	setupAxiosInterceptors(router);

	// Initialize services
	const initializationService = new InitializationService({
		app,
		router,
		i18n: i18n.global,
	});

	try {
		await initializationService.initialize();
		console.log("Application initialized successfully");

		// Provide global values and services
		app.provide("currentLanguage", i18n.global.locale.value);
		app.provide("changeLanguage", async (lang: string) => {
			if (lang !== i18n.global.locale.value) {
				try {
					if (lang !== DEFAULT_LANGUAGE) {
						const module = await import(`./i18n/translations/${lang}.ts`);
						i18n.global.setLocaleMessage(lang, module.default);
					}
					i18n.global.locale.value = lang;
					setHtmlLang(lang);
					translationStore.setCurrentLanguage(lang);
					return true;
				} catch (error) {
					console.error(`Failed to change language to ${lang}`, error);
					return false;
				}
			}
			return true;
		});

		// Provide services globally for component access
		app.provide("accountService", initializationService.getAccountService());

		// Mount the app after initialization is complete
		app.mount("#app");
	} catch (error) {
		console.error("Failed to initialize application:", error);
	}
}

// Start the application
bootstrap().catch((error) => {
	console.error("Failed to bootstrap application:", error);
});
