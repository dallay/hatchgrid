import { createPinia } from "pinia";
import { createApp } from "vue";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import { useTranslationStore } from "@/stores/translation.store";
import App from "./App.vue";
import { setupI18n } from "./i18n";
import { initTranslations } from "./i18n/loader";
import router from "./router";
import "./style.css";

/// <reference types="unplugin-icons/types/vue" />

async function bootstrap() {
	const app = createApp(App);
	const pinia = createPinia();
	app.use(pinia);

	// Initialize translation store and load language from storage
	const translationStore = useTranslationStore();
	translationStore.loadLanguageFromStorage();

	// Setup i18n instance
	const i18n = setupI18n();
	app.use(i18n);

	// Load translations
	await initTranslations(i18n);

	// Setup router and axios interceptors
	app.use(router);
	setupAxiosInterceptors(router);

	// Mount the app
	app.mount("#app");
}

bootstrap().catch((error) => {
	console.error("Failed to bootstrap the application:", error);
});
