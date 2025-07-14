import type { App } from "vue";
import { watch } from "vue";
import type { Router } from "vue-router";
import TranslationService from "@/i18n/translation.service.ts";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";
import { useTranslationStore } from "@/stores/translation";

export interface InitializationOptions {
	app: App;
	router: Router;
	i18n: any;
}

export class InitializationService {
	private authStore!: ReturnType<typeof useAuthStore>;
	private translationStore!: ReturnType<typeof useTranslationStore>;
	private translationService!: TranslationService;
	private accountService!: AccountService;
	private readonly router!: Router;

	constructor(private readonly options: InitializationOptions) {
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
		this.translationService = new TranslationService(this.options.i18n);
		this.accountService = new AccountService(this.authStore);

		// Set up router guards
		this.setupRouterGuards();

		// Initialize language settings
		await this.initializeLanguage();

		// Initialize authentication
		await this.initializeAuthentication();
	}

	/**
	 * Set up Vue Router navigation guards
	 */
	private setupRouterGuards(): void {
		this.router.beforeResolve(async (to, _from, next) => {
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

		// Determine the best language to use
		const storedLanguage = this.translationService.getLocalStoreLanguage();
		const userLanguage = this.authStore.account?.langKey;
		const browserLanguage = navigator.language.split("-")[0];

		const preferredLanguage =
			[
				storedLanguage,
				userLanguage,
				browserLanguage,
				"en", // fallback
			].find(
				(lang) => lang && this.translationService.isLanguageSupported(lang),
			) || "en";

		// Set up language change handler
		this.setupLanguageWatchers();

		// Load the preferred language
		await this.changeLanguage(preferredLanguage);
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
			this.router.push({ path: "/login" });
		}
	}

	/**
	 * Set up reactive language watchers
	 */
	private setupLanguageWatchers(): void {
		// Watch for account language changes
		watch(
			() => this.authStore.account?.langKey,
			(newLangKey) => {
				if (
					newLangKey &&
					!this.translationService.getLocalStoreLanguage() &&
					newLangKey !== this.translationStore.currentLanguage
				) {
					this.changeLanguage(newLangKey);
				}
			},
		);

		// Watch for translation store changes
		watch(
			() => this.translationStore.currentLanguage,
			(newLanguage) => {
				this.translationService.setLocale(newLanguage);
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
