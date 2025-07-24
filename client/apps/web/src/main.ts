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

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
setupAxiosInterceptors(router);
useRouteGuards(router);

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
