import { createPinia } from "pinia";
import { createApp } from "vue";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import { InitializationService } from "@/services/initialization.service";
import initI18N from "./i18n/i18n.config.ts";
import TranslationService, {
	createI18nAdapter,
	type I18nLike,
} from "./i18n/translation.service.ts";
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

	// Create translation service with proper error handling
	let tempTranslationService: TranslationService;
	try {
		// Create an adapter that converts i18n.global to our I18nLike interface
		const i18nAdapter = createI18nAdapter(i18n.global);
		tempTranslationService = new TranslationService(i18nAdapter);
	} catch (error) {
		console.error("Failed to create translation service:", error);
		// Create a fallback minimal implementation that will work with our expected interface
		const fallbackI18n: I18nLike = {
			locale: { value: initialLanguage },
			messages: { value: {} },
			setLocaleMessage: (lang, messages) => {
				console.log(`[Fallback] Setting messages for ${lang}`);
				fallbackI18n.messages.value[lang] = messages;
			},
		};
		tempTranslationService = new TranslationService(fallbackI18n);
	}

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
	let initializationService: InitializationService;
	try {
		// Create an adapter for the initialization service
		const i18nAdapter = createI18nAdapter(i18n.global);
		initializationService = new InitializationService({
			app,
			router,
			i18n: i18nAdapter,
		});
	} catch (error) {
		console.error("Failed to create initialization service:", error);
		// Create a fallback minimal implementation
		const fallbackI18n: I18nLike = {
			locale: { value: initialLanguage },
			messages: { value: {} },
			setLocaleMessage: (lang, messages) => {
				console.log(`[Fallback] Setting messages for ${lang}`);
				fallbackI18n.messages.value[lang] = messages;
			},
		};
		initializationService = new InitializationService({
			app,
			router,
			i18n: fallbackI18n,
		});
	}

	try {
		await initializationService.initialize();
		console.log("Application initialized successfully");

		// Use the adapter to get the locale value
		const i18nAdapter = createI18nAdapter(i18n.global);
		app.provide("currentLanguage", i18nAdapter.locale.value);
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
