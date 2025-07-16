import { createPinia } from "pinia";
import { createApp } from "vue";
import type { Composer } from "vue-i18n";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import { InitializationService } from "@/services/initialization.service";
import initI18N from "./i18n/i18n.config.ts";
import TranslationService from "./i18n/translation.service.ts";
import {
	DEFAULT_LANGUAGE,
	useTranslationStore,
} from "./stores/translation.store.ts";
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
	const initialLanguage = translationStore.currentLanguage ?? DEFAULT_LANGUAGE;

	// 2. Create an i18n instance and service to load the language
	const i18n = initI18N({
		locale: initialLanguage,
	});
	const tempTranslationService = new TranslationService(
		i18n.global as Composer,
	);

	// 3. Load the initial language messages and wait for it
	try {
		await tempTranslationService.refreshTranslation(initialLanguage);
		console.log(`Successfully loaded initial language: ${initialLanguage}`);
	} catch (error) {
		console.error(
			`Failed to load initial language '${initialLanguage}', falling back to 'en'.`,
			error,
		);
		if (initialLanguage !== DEFAULT_LANGUAGE) {
			await tempTranslationService.refreshTranslation(DEFAULT_LANGUAGE);
		}
	}
	// --- End Language Initialization ---

	// Now that the language is loaded, we can use the router and mount the app
	app.use(router);
	app.use(i18n);

	setupAxiosInterceptors(router);

	// Initialize all services and stores
	const initializationService = new InitializationService({
		app,
		router,
		i18n: i18n.global as Composer,
	});

	try {
		await initializationService.initialize();
		console.log("Application initialized successfully");

		app.provide("currentLanguage", i18n.global.locale);
		app.provide("changeLanguage", initializationService.changeLanguage);
		// Provide services globally for component access
		app.provide(
			"translationService",
			initializationService.getTranslationService(),
		);
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
