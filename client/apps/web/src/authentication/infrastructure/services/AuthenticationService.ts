import type { Router } from "vue-router";
import type { LogoutUseCase } from "@/authentication/application";
import type { Account } from "@/authentication/domain/models";
import type { AccountApi } from "@/authentication/infrastructure/api/AccountApi";
import type { useAuthStore } from "@/authentication/infrastructure/store/useAuthStore";

/**
 * Authentication service that bridges the old AccountService functionality
 * with the new hexagonal architecture. This service coordinates between
 * the application layer use cases and the infrastructure layer.
 */
export class AuthenticationService {
	private readonly authStore: ReturnType<typeof useAuthStore>;
	private readonly router?: Router;
	private readonly accountApi: AccountApi;
	private readonly logoutUseCase: LogoutUseCase;
	private _updateLock: Promise<void> | null = null;

	constructor(
		authStore: ReturnType<typeof useAuthStore>,
		accountApi: AccountApi,
		logoutUseCase: LogoutUseCase,
		router?: Router,
	) {
		this.authStore = authStore;
		this.router = router;
		this.accountApi = accountApi;
		this.logoutUseCase = logoutUseCase;
	}

	async update(): Promise<void> {
		if (this._updateLock) {
			await this._updateLock;
			return;
		}
		this._updateLock = (async () => {
			try {
				if (!this.authStore.profilesLoaded) {
					console.log("Retrieving profiles...");
					await this.retrieveProfiles();
					this.authStore.setProfilesLoaded();
				}
				await this.loadAccount();
			} finally {
				this._updateLock = null;
			}
		})();
		await this._updateLock;
	}

	async retrieveProfiles(): Promise<boolean> {
		try {
			const profileInfo = await this.accountApi.getProfiles();
			if (profileInfo?.activeProfiles) {
				this.authStore.setActiveProfiles(profileInfo.activeProfiles);
				const profileData = profileInfo as Record<string, unknown>;
				const profileDisplayRibbon = profileData["display-ribbon-on-profiles"];
				console.log("✅ profileDisplayRibbon", profileDisplayRibbon);
				if (profileDisplayRibbon) {
					this.authStore.setRibbonOnProfiles(profileDisplayRibbon as string);
				}
			}
			return true;
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error("Failed to retrieve application profiles:", error);
			}
			return false;
		}
	}

	async retrieveAccount(): Promise<boolean> {
		try {
			const account = await this.accountApi.getAccount();
			if (account) {
				this.authStore.setAuthentication(account);
				return true;
			}
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error("Failed to retrieve account:", error);
			}
			this.authStore.clearAuth();
			this.redirectToLogin();
			return false;
		}

		this.authStore.logout();
		return false;
	}

	async loadAccount(): Promise<void> {
		if (this.authStore.logon) {
			await this.authStore.logon;
			return;
		}

		if (this.authenticated && this.userAuthorities.length > 0) {
			return;
		}

		const promise = this.retrieveAccount();
		this.authStore.authenticate(promise);

		try {
			await promise;
		} finally {
			this.authStore.logon = null;
		}
	}

	async hasAnyAuthorityAndCheckAuth(
		authorities: string | string[],
	): Promise<boolean> {
		const authoritiesArray = Array.isArray(authorities)
			? authorities
			: [authorities];

		if (!this.authenticated || this.userAuthorities.length === 0) {
			await this.loadAccount();
		}

		return this.checkAuthorities(authoritiesArray);
	}

	hasAuthority(authority: string): boolean {
		return this.userAuthorities.includes(authority);
	}

	hasAnyAuthority(authorities: string[]): boolean {
		return authorities.some((authority) => this.hasAuthority(authority));
	}

	private checkAuthorities(authorities: string[]): boolean {
		if (!this.authenticated || this.userAuthorities.length === 0) {
			return false;
		}

		return authorities.some((authority) =>
			this.userAuthorities.includes(authority),
		);
	}

	get authenticated(): boolean {
		return this.authStore.authenticated;
	}

	get userAuthorities(): string[] {
		return Array.from(this.authStore.userIdentity?.authorities ?? []);
	}

	get account(): Account | null {
		return this.authStore.userIdentity;
	}

	get isAdmin(): boolean {
		return this.hasAuthority("ROLE_ADMIN");
	}

	get isUser(): boolean {
		return this.hasAuthority("ROLE_USER");
	}

	get userLanguage(): string {
		return this.account?.langKey || "en";
	}

	async updateLanguage(langKey: string): Promise<boolean> {
		if (!this.authenticated) {
			return false;
		}

		try {
			const success = await this.accountApi.updateLanguage(langKey);
			if (success && this.authStore.userIdentity) {
				this.authStore.setAuthentication({
					...this.authStore.userIdentity,
					langKey,
				});
			}
			return success;
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error("Failed to update user language:", error);
			}
			return false;
		}
	}

	async logout(): Promise<void> {
		await this.logoutUseCase.execute();
		this.authStore.logout();
		await this.redirectToLogin();
	}

	private async redirectToLogin(): Promise<void> {
		const currentPath =
			this.router?.currentRoute.value.path ?? window.location.pathname;
		if (currentPath !== "/login") {
			if (this.router) {
				await this.router.push({ name: "Login" });
			} else {
				window.location.href = "/login";
			}
		}
	}
}
