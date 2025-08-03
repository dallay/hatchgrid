import { createPinia } from "pinia";
import { createApp } from "vue";
import { setupAxiosInterceptors } from "@/config/axios-interceptor";
import {
	DEFAULT_LOCALE,
	i18n,
	LANGUAGE_STORAGE_KEY,
	SUPPORTED_LOCALES,
	setLocale,
} from "@/i18n";
import router from "@/router";
import App from "./App.vue";
import "@/style.css";
import { useRouteGuards } from "@/composables/useRouteGuards";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";
import { initializeWorkspaceStore } from "@/workspace/providers/workspaceStoreProvider";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
setupAxiosInterceptors(router);
useRouteGuards(router);

// Initialize workspace store with default configuration
// This is optional - the store will be created lazily if not called
try {
	initializeWorkspaceStore();
} catch (error) {
	// Log the error and prevent app startup failure
	// You may want to show a user-friendly notification here as well
	console.error("Failed to initialize workspace store:", error);
}

const authStore = useAuthStore();
const accountService = new AccountService(authStore, router);
app.provide("accountService", accountService);

const userPreferredLocale =
	localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
	navigator.language.split("-")[0];
const validLocale = SUPPORTED_LOCALES.includes(userPreferredLocale)
	? userPreferredLocale
	: DEFAULT_LOCALE;
setLocale(validLocale).then(() => {
	app.mount("#app");
});
