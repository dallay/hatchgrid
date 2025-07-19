import type { App } from "vue";
import { watch } from "vue";
import type { Router } from "vue-router";
import TranslationService, {
	type I18nLike,
	isI18nLike,
} from "@/i18n/translation.service";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";
import { useTranslationStore } from "@/stores/translation.store";

export interface InitializationOptions {
	app: App;
	router: Router;
	i18n: I18nLike;
}

export class InitializationService {
	private authStore!: ReturnType<typeof useAuthStore>;
	private translationStore!: ReturnType<typeof useTranslationStore>;
	private translationService!: TranslationService;
	private accountService!: AccountService;
	private readonly router!: Router;

	constructor(private readonly options: InitializationOptions) {
		// Validate that the i18n instance conforms to I18nLike interface
		if (!isI18nLike(options.i18n)) {
			throw new Error(
				"Invalid i18n instance provided to InitializationService. The object does not implement the required I18nLike interface.",
			);
		}
		this.router = options.router;
	}

	/**
	 * Initialize all services and stores
	 */
	async initialize(): Promise<void> {
		// Initialize stores
		this.authStore = useAuthStore();
		this.translationStore = useTranslationStore();

		// Initialize services
		try {
			this.translationService = new TranslationService(this.options.i18n);
		} catch (error) {
			console.error("Failed to create TranslationService:", error);
			throw new Error(
				"Failed to initialize translation service. See console for details.",
			);
		}
		this.accountService = new AccountService(this.authStore, this.router);

		// Set up router guards
		this.setupRouterGuards();

		// Initialize language settings
		await this.initializeLanguage();

		// Set up language watchers for reactivity
		this.setupLanguageWatchers();

		// Only initialize authentication if not on a public page
		const publicPages = ["/login", "/register"];
		if (!publicPages.includes(this.router.currentRoute.value.path)) {
			await this.initializeAuthentication();
		}
	}

	/**
	 * Set up Vue Router navigation guards
	 */
	private setupRouterGuards(): void {
		this.router.beforeResolve(async (to, _from, next) => {
			// Prevent account update loop if navigating to login or register
			if (to.path === "/login" || to.path === "/register") {
				next();
				return;
			}

			// Initialize account if not authenticated
			if (!this.authStore.authenticated) {
				try {
					await this.accountService.update();
				} catch (error) {
					console.warn("Failed to update account in router guard:", error);
					next({
						path: "/login",
						query: { redirect: to.fullPath },
					});
					return;
				}
			}

			// Check route authorities
			if (
				to.meta?.authorities &&
				Array.isArray(to.meta.authorities) &&
				to.meta.authorities.length > 0
			) {
				const hasRequiredAuthority =
					await this.accountService.hasAnyAuthorityAndCheckAuth(
						to.meta.authorities,
					);

				if (!hasRequiredAuthority) {
					if (this.authStore.authenticated) {
						// User is authenticated but doesn't have required authority
						next({ path: "/forbidden" });
					} else {
						// User is not authenticated, redirect to login
						next({
							path: "/login",
							query: { redirect: to.fullPath },
						});
					}
					return;
				}
			}

			next();
		});
	}

	/**
	 * Initialize language settings and translation system
	 */
	private async initializeLanguage(): Promise<void> {
		// Load language from localStorage first
		this.translationStore.loadLanguageFromStorage();

		// Detect and set the preferred language
		await this.detectAndSetPreferredLanguage();
	}

	/**
	 * Detect and set the preferred language for the application
	 */
	async detectAndSetPreferredLanguage(): Promise<void> {
		const userLang = this.accountService.userLanguage;
		const localLang = this.translationService.getLocalStoreLanguage();
		const browserLang = navigator.language?.split("-")[0];
		const isLanguageSupported = (lang: string | null | undefined) =>
			lang ? this.translationService.isLanguageSupported(lang) : false;

		const initialLang = [localLang, userLang, browserLang, "en"].find(
			isLanguageSupported,
		);
		if (initialLang) {
			await this.changeLanguage(initialLang);
		}
	}

	/**
	 * Initialize authentication state
	 */
	private async initializeAuthentication(): Promise<void> {
		try {
			await this.accountService.update();
		} catch (error) {
			console.warn("Failed to initialize authentication:", error);
			// Redirect to login if authentication fails
			await this.router.push({ path: "/login" });
		}
	}

	/**
	 * Set up reactive language watchers
	 */
	private setupLanguageWatchers(): void {
		// Watch for translation store changes
		watch(
			() => this.authStore.account,
			async (value) => {
				if (!this.translationService.getLocalStoreLanguage()) {
					const langKey = value?.langKey ?? "en";
					await this.changeLanguage(langKey);
				}
			},
		);
		watch(
			() => this.translationStore.currentLanguage,
			(newLanguage) => {
				this.translationService.setLocale(newLanguage ?? "en");
			},
		);
	}

	/**
	 * Change the application language
	 */
	async changeLanguage(newLanguage: string): Promise<void> {
		if (this.translationService.getCurrentLanguage() !== newLanguage) {
			this.translationStore.setLoading(true);

			try {
				await this.translationService.refreshTranslation(newLanguage);
				this.translationStore.setCurrentLanguage(newLanguage);
			} catch (error) {
				console.error("Failed to change language:", error);
				// Fallback to English if language change fails
				if (newLanguage !== "en") {
					await this.changeLanguage("en");
				}
			} finally {
				this.translationStore.setLoading(false);
			}
		}
	}

	/**
	 * Get the translation service instance
	 */
	getTranslationService(): TranslationService {
		return this.translationService;
	}

	/**
	 * Get the account service instance
	 */
	getAccountService(): AccountService {
		return this.accountService;
	}
}
