import axios, { type AxiosResponse } from "axios";
import type { Account } from "@/security/account.model";
import type { useAuthStore } from "@/stores/auth";

export interface ProfileInfo {
	activeProfiles: string[];
	"display-ribbon-on-profiles"?: string;
	git?: {
		branch?: string;
		commit?: {
			id?: string;
			time?: string;
		};
	};
	build?: {
		version?: string;
		timestamp?: string;
	};
}

export default class AccountService {
	private authStore: ReturnType<typeof useAuthStore>;

	constructor(authStore: ReturnType<typeof useAuthStore>) {
		this.authStore = authStore;
	}

	/**
	 * Main update method that retrieves profiles and account information
	 */
	async update(): Promise<void> {
		if (!this.authStore.profilesLoaded) {
			await this.retrieveProfiles();
			this.authStore.setProfilesLoaded();
		}
		await this.loadAccount();
	}

	/**
	 * Retrieve application profiles and configuration
	 */
	async retrieveProfiles(): Promise<boolean> {
		try {
			const response: AxiosResponse<ProfileInfo> =
				await axios.get("/management/info");

			if (response.data?.activeProfiles) {
				this.authStore.setActiveProfiles(response.data.activeProfiles);

				if (response.data["display-ribbon-on-profiles"]) {
					this.authStore.setRibbonOnProfiles(
						response.data["display-ribbon-on-profiles"],
					);
				}
			}

			return true;
		} catch (error) {
			console.error("Failed to retrieve application profiles:", error);
			return false;
		}
	}

	/**
	 * Retrieve current user account information
	 */
	async retrieveAccount(): Promise<boolean> {
		try {
			const response: AxiosResponse<Account> = await axios.get("/api/account", { withCredentials: true });
      console.log("Account retrieved:", response.data);
      if (response.status === 200 && response.data?.login) {
				this.authStore.setAuthentication(response.data);
				return true;
			}
		} catch (error) {
			console.error("Failed to retrieve account:", error);
		}

		this.authStore.logout();
		return false;
	}

	/**
	 * Load account with promise tracking
	 */
	async loadAccount(): Promise<void> {
		// If already authenticating, wait for the existing promise
		if (this.authStore.logon) {
			await this.authStore.logon;
			return;
		}


		// If already authenticated with valid token and authorities, skip
		if (this.authenticated && this.userAuthorities.length > 0) {
			return;
		}

		// Create and track the authentication promise
		const promise = this.retrieveAccount();
		this.authStore.authenticate(promise);

		try {
			await promise;
		} finally {
			// Clear the authentication promise
			this.authStore.logon = null;
		}
	}

	/**
	 * Check if user has any of the required authorities
	 */
	async hasAnyAuthorityAndCheckAuth(
		authorities: string | string[],
	): Promise<boolean> {
		const authoritiesArray = Array.isArray(authorities)
			? authorities
			: [authorities];

		// Ensure we have current account information
		if (!this.authenticated) {
			await this.loadAccount();
		}

		return this.checkAuthorities(authoritiesArray);
	}

	/**
	 * Check if user has a specific authority
	 */
	hasAuthority(authority: string): boolean {
		return this.userAuthorities.includes(authority);
	}

	/**
	 * Check if user has any of the specified authorities
	 */
	hasAnyAuthority(authorities: string[]): boolean {
		return authorities.some((authority) => this.hasAuthority(authority));
	}



	/**
	 * Check if user has required authorities
	 */
	private checkAuthorities(authorities: string[]): boolean {
		if (!this.authenticated || this.userAuthorities.length === 0) {
			return false;
		}

		return authorities.some((authority) =>
			this.userAuthorities.includes(authority),
		);
	}

	/**
	 * Get current authentication status
	 */
	get authenticated(): boolean {
		return this.authStore.authenticated;
	}

	/**
	 * Get current user authorities
	 */
	get userAuthorities(): string[] {
		return this.authStore.account?.authorities || [];
	}

	/**
	 * Get current user account
	 */
	get account(): Account | null {
		return this.authStore.account;
	}

	/**
	 * Check if user is an admin
	 */
	get isAdmin(): boolean {
		return this.hasAuthority("ROLE_ADMIN");
	}

	/**
	 * Check if user is a regular user
	 */
	get isUser(): boolean {
		return this.hasAuthority("ROLE_USER");
	}

	/**
	 * Get user's preferred language
	 */
	get userLanguage(): string {
		return this.account?.langKey || "en";
	}

	/**
	 * Update user language preference
	 */
	async updateLanguage(langKey: string): Promise<boolean> {
		if (!this.authenticated) {
			return false;
		}

		try {
			await axios.post("/api/account/change-language", { langKey });

			// Update local account data
			if (this.authStore.userIdentity) {
				this.authStore.userIdentity.langKey = langKey;
			}

			return true;
		} catch (error) {
			console.error("Failed to update user language:", error);
			return false;
		}
	}
}
