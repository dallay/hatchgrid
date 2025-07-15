import { avatar } from "@hatchgrid/utilities";
import axios, { type AxiosResponse, isAxiosError } from "axios";
import type { Router } from "vue-router";
import type { Account } from "@/security/account.model";
import type { UserResponse } from "@/services/response/user.response.ts";
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
	private readonly authStore: ReturnType<typeof useAuthStore>;
	private readonly router?: Router;
	private _updateLock: Promise<void> | null = null;

	constructor(authStore: ReturnType<typeof useAuthStore>, router?: Router) {
		this.authStore = authStore;
		this.router = router;
	}

	async update(): Promise<void> {
		if (this._updateLock) {
			await this._updateLock;
			return;
		}
		this._updateLock = (async () => {
			try {
				if (!this.authStore.profilesLoaded) {
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
			if (isAxiosError(error)) {
				console.error(
					"Failed to retrieve application profiles:",
					error.response?.status,
				);
			} else {
				console.error("Unknown error retrieving profiles:", error);
			}
			return false;
		}
	}

	async retrieveAccount(): Promise<boolean> {
		try {
			const response: AxiosResponse<UserResponse> = await axios.get(
				"/api/account",
				{
					withCredentials: true,
				},
			);

			const data = response.data;
			const account: Account = {
				...data,
				fullname:
					[data.firstname, data.lastname].filter(Boolean).join(" ") ||
					undefined,
				langKey: "en", // in the future, this could be dynamic from user settings
				activated: true, // assuming the account is always activated
				imageUrl: avatar(data.email, 100),
			};

			if (response.status === 200 && account?.username) {
				this.authStore.setAuthentication({
					...account,
					username: account.username,
				});
				return true;
			}
		} catch (error: unknown) {
			if (isAxiosError(error)) {
				const status = error.response?.status;
				if (status === 401 || status === 403) {
					this.authStore.clearAuth();
					this.redirectToLogin();
					return false;
				}
				console.error("Failed to retrieve account:", status);
			} else {
				console.error("Unknown error retrieving account:", error);
			}
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
			await axios.post("/api/account/change-language", { langKey });

			if (this.authStore.userIdentity) {
				this.authStore.setAuthentication({
					...this.authStore.userIdentity,
					langKey,
				});
			}

			return true;
		} catch (error) {
			console.error("Failed to update user language:", error);
			return false;
		}
	}

	async logout(): Promise<void> {
		await this.authStore.logoutAsync();
		this.redirectToLogin();
	}

	private redirectToLogin(): void {
		const currentPath =
			this.router?.currentRoute.value.path || window.location.pathname;
		if (currentPath !== "/login") {
			if (this.router) {
				this.router.push("/login");
			} else {
				window.location.href = "/login";
			}
		}
	}
}
