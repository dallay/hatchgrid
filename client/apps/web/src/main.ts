import { createPinia } from "pinia";
import { createApp } from "vue";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import { InitializationService } from "@/services/initialization.service";
import initI18N from "./i18n/i18n.config.ts";
import "./style.css";
import App from "./App.vue";
import router from "./router";

/// <reference types="unplugin-icons/types/vue" />

async function bootstrap() {
	const app = createApp(App);
	const pinia = createPinia();
	const i18n = initI18N();

	// Add plugins to Vue app
	app.use(pinia);
	app.use(router);
	app.use(i18n);

	// Set up axios interceptors with updated error handling
	setupAxiosInterceptors(router);

	// Initialize all services and stores
	const initializationService = new InitializationService({
		app,
		router,
		i18n: i18n.global, // The global composer instance
	});

	try {
		await initializationService.initialize();
		console.log("Application initialized successfully");
	} catch (error) {
		console.error("Failed to initialize application:", error);
		// Continue with app mounting even if initialization fails
	}

	// Provide services globally for component access
	app.provide(
		"translationService",
		initializationService.getTranslationService(),
	);
	app.provide("accountService", initializationService.getAccountService());

	// Mount the app
	app.mount("#app");
}

// Start the application
bootstrap().catch((error) => {
	console.error("Failed to bootstrap application:", error);
});
