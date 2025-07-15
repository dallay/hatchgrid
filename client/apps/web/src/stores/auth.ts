import { avatar } from "@hatchgrid/utilities";
import axios, { type AxiosError } from "axios";
import { defineStore } from "pinia";
import { transformUserResponseToAccount } from "@/services/mapper/account.mapper.ts";
import type { UserResponse } from "@/services/response/user.response";
import type { Account } from "../security/account.model";

export interface AuthStateStorable {
	logon: Promise<unknown> | null;
	userIdentity: Account | null;
	authenticated: boolean;
	profilesLoaded: boolean;
	ribbonOnProfiles: string | null;
	activeProfiles: string[];
}

export const defaultAuthState: AuthStateStorable = {
	logon: null,
	userIdentity: null,
	authenticated: false,
	profilesLoaded: false,
	ribbonOnProfiles: null,
	activeProfiles: [],
};

export const useAuthStore = defineStore("auth", {
	state: (): AuthStateStorable => ({ ...defaultAuthState }),
	getters: {
		account: (state) => state.userIdentity,
		isAuthenticated: (state) => state.authenticated,
	},
	actions: {
		authenticate(promise: Promise<unknown>) {
			this.logon = promise;
		},
		setAuthentication(identity: Account) {
			// if identity.imageUrl is not set, generate it using the avatar utility
			identity.imageUrl ??= avatar(identity.email ?? "", 100);
			this.userIdentity = identity;
			this.authenticated = true;
			this.logon = null;
		},
		logout() {
			this.userIdentity = null;
			this.authenticated = false;
			this.logon = null;
		},
		setProfilesLoaded() {
			this.profilesLoaded = true;
		},
		setActiveProfiles(profile: string[]) {
			this.activeProfiles = profile;
		},
		setRibbonOnProfiles(ribbon: string | null) {
			this.ribbonOnProfiles = ribbon;
		},
		clearAuth() {
			this.userIdentity = null;
			this.authenticated = false;
			this.logon = null;
		},

		async getAccount(): Promise<void> {
			try {
				const { data } = await axios.get<Account>("/api/account");
				this.setAuthentication(data);
			} catch (_error) {
				this.clearAuth();
				throw new Error("Failed to fetch account information.");
			}
		},

		async login(username: string, password: string): Promise<boolean> {
			try {
				const loginPromise = axios.post("/api/login", { username, password });
				this.authenticate(loginPromise);

				await loginPromise;

				// After successful login, fetch account info and set authentication state
				const { data } = await axios.get<UserResponse>("/api/account");
				const account: Account = transformUserResponseToAccount(data);
				this.setAuthentication(account);
				return true;
			} catch (error) {
				this.clearAuth();
				const axiosError = error as AxiosError;
				if (axiosError.response?.status === 401) {
					throw new Error("Invalid credentials.");
				}
				throw new Error("Login failed.");
			}
		},

		async logoutAsync(): Promise<void> {
			try {
				await axios.post("/api/logout");
			} catch (_error) {
				// handle logout error silently
			} finally {
				this.logout();
			}
		},

		hasAuthority(authority: string): boolean {
			return (
				Array.from(this.userIdentity?.authorities || []).includes(authority) ??
				false
			);
		},

		hasAnyAuthority(authorities: string[]): boolean {
			return authorities.some((auth) => this.hasAuthority(auth));
		},
	},
});
