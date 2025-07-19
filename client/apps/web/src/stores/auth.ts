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

export interface RegistrationData {
	login: string;
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	langKey: string;
}

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

		async register(registrationData: RegistrationData): Promise<void> {
			await axios.post("/api/register", registrationData);
		},

		async getAccount(): Promise<void> {
			try {
				const response = await axios.get("/api/account", {
					responseType: "text",
				});
				// Detect if response is HTML (session expired)
				const contentType = response.headers["content-type"];
				const isHtml =
					contentType?.includes("text/html") ||
					(typeof response.data === "string" &&
						response.data.trim().startsWith("<"));
				if (isHtml) {
					this.clearAuth();
					throw new Error("Session expired. Please log in again.");
				}
				// If not HTML, parse as Account
				const accountData =
					typeof response.data === "string"
						? JSON.parse(response.data)
						: response.data;
				this.setAuthentication(accountData);
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
			return Array.from(this.userIdentity?.authorities || []).includes(
				authority,
			);
		},

		hasAnyAuthority(authorities: string[]): boolean {
			return authorities.some((auth) => this.hasAuthority(auth));
		},
	},
});
