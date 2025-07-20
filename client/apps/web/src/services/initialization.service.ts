import type { App } from "vue";
import { watch } from "vue";
import type { Composer } from "vue-i18n";
import type { Router } from "vue-router";
import {
	DEFAULT_LANGUAGE,
	isLanguageSupported,
	setHtmlLang,
} from "@/i18n/config";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";
import { useTranslationStore } from "@/stores/translation.store";

export interface InitializationOptions {
	app: App;
	router: Router;
	i18n: Composer;
}

export class InitializationService {
	private authStore!: ReturnType<typeof useAuthStore>;
	private translationStore!: ReturnType<typeof useTranslationStore>;
	private accountService!: AccountService;
	private readonly router!: Router;
	private readonly i18n: Composer;

	constructor(options: InitializationOptions) {
		this.router = options.router;
		this.i18n = options.i18n;
	}

	/**
	 * Initialize all services and stores
	 */
	async initialize(): Promise<void> {
		// Initialize stores
		this.authStore = useAuthStore();
		this.translationStore = useTranslationStore();

		// Initialize services
		this.accountService = new AccountService(this.authStore, this.router);

		// Set up router guards
		this.setupRouterGuards();

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
				if (!localStorage.getItem("currentLanguage")) {
					const langKey = value?.langKey ?? DEFAULT_LANGUAGE;
					await this.changeLanguage(langKey);
				}
			},
		);

		// Watch for translation store changes
		watch(
			() => this.translationStore.currentLanguage,
			(newLanguage) => {
				if (newLanguage && this.i18n.locale.value !== newLanguage) {
					this.i18n.locale.value = newLanguage;
					setHtmlLang(newLanguage);
				}
			},
		);
	}

	/**
	 * Change the application language
	 */
	async changeLanguage(newLanguage: string): Promise<void> {
		const languageToUse = isLanguageSupported(newLanguage)
			? newLanguage
			: DEFAULT_LANGUAGE;

		if (!isLanguageSupported(newLanguage)) {
			console.warn(`Language ${newLanguage} is not supported, using default`);
		}

		if (this.i18n.locale.value !== languageToUse) {
			this.translationStore.setLoading(true);

			try {
				// Load the language if it's not the default
				if (
					languageToUse !== DEFAULT_LANGUAGE &&
					!this.i18n.availableLocales.includes(languageToUse)
				) {
					const module = await import(
						`../i18n/translations/${languageToUse}.ts`
					);
					this.i18n.setLocaleMessage(languageToUse, module.default);
				}

				// Update the locale
				this.i18n.locale.value = languageToUse;
				setHtmlLang(languageToUse);

				// Update the store
				this.translationStore.setCurrentLanguage(languageToUse);
			} catch (error) {
				console.error("Failed to change language:", error);
				// Fallback to English if language change fails
				if (languageToUse !== DEFAULT_LANGUAGE) {
					await this.changeLanguage(DEFAULT_LANGUAGE);
				}
			} finally {
				this.translationStore.setLoading(false);
			}
		}
	}

	/**
	 * Get the account service instance
	 */
	getAccountService(): AccountService {
		return this.accountService;
	}
}
