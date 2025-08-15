import { createPinia } from "pinia";
import { createApp } from "vue";
import {
	DEFAULT_LOCALE,
	i18n,
	LANGUAGE_STORAGE_KEY,
	SUPPORTED_LOCALES,
	setLocale,
} from "@/i18n";
import router from "@/router";
import { setupAxiosInterceptors } from "@/shared/config/axios-interceptor";
import App from "./App.vue";
import "@/style.css";
import {
	LoginUseCase,
	LogoutUseCase,
	RegisterUseCase,
} from "@/authentication/application";
import { AccountApi } from "@/authentication/infrastructure/api";
import { AuthenticationService } from "@/authentication/infrastructure/services";
import { useAuthStore } from "@/authentication/infrastructure/store";
import { useRouteGuards } from "@/composables/useRouteGuards";
import { configureStoreFactory as configureSubscribersStoreFactory } from "@/subscribers/infrastructure/di";
import { useSubscriberStore } from "@/subscribers/infrastructure/store";
import {
	configureTagServiceProvider,
	initializeTagsModule,
	useTagStore,
} from "@/tag";
import { configureStoreFactory as configureTagsStoreFactory } from "@/tag/infrastructure/di";
import { DefaultTagServiceProvider } from "@/tag/infrastructure/services";
import { initializeWorkspaceStore } from "@/workspace/infrastructure/providers/workspaceStoreProvider";

const app = createApp(App);

app.use(createPinia());

// Configure subscribers store factory for dependency injection
configureSubscribersStoreFactory(() => useSubscriberStore());

// Configure and initialize tags module
configureTagServiceProvider(new DefaultTagServiceProvider());
// Configure store factory for the tags module, then initialize
configureTagsStoreFactory(() => useTagStore());
initializeTagsModule();

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

// Dependency container type for better type safety
interface DependencyContainer {
	authStore: ReturnType<typeof useAuthStore>;
	accountApi: AccountApi;
	authenticationService: AuthenticationService;
	loginUseCase: LoginUseCase;
	logoutUseCase: LogoutUseCase;
	registerUseCase: RegisterUseCase;
}

// Create dependency injection container
const createDependencyContainer = (): DependencyContainer => {
	const authStore = useAuthStore();
	const accountApi = new AccountApi();
	const loginUseCase = new LoginUseCase(accountApi);
	const logoutUseCase = new LogoutUseCase(accountApi);
	const registerUseCase = new RegisterUseCase(accountApi);
	const authenticationService = new AuthenticationService(
		authStore,
		accountApi,
		logoutUseCase,
		router,
	);

	return {
		authStore,
		accountApi,
		authenticationService,
		loginUseCase,
		logoutUseCase,
		registerUseCase,
	};
};

// Create dependencies lazily to improve startup performance
let dependencyContainer: DependencyContainer | null = null;

const getDependencies = (): DependencyContainer => {
	if (!dependencyContainer) {
		dependencyContainer = createDependencyContainer();
	}
	return dependencyContainer;
};

// Provide lazy dependency access
app.provide("getDependencies", getDependencies);

// For backward compatibility, provide individual dependencies
const dependencies = getDependencies();
Object.entries(dependencies).forEach(([key, value]) => {
	app.provide(key, value);
});

const userPreferredLocale =
	localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
	navigator.language.split("-")[0];
const validLocale = SUPPORTED_LOCALES.includes(userPreferredLocale)
	? userPreferredLocale
	: DEFAULT_LOCALE;
setLocale(validLocale).then(() => {
	app.mount("#app");
});
