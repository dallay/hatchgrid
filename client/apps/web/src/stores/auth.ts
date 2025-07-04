import axios, { type AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Account } from "../security/account.model";

export const useAuthStore = defineStore("auth", () => {
	const account = ref<Account | null>(null);
	const isAuthenticated = computed(() => !!account.value);

	function setAccount(data: Account | null) {
		account.value = data;
	}

	function clearAuth() {
		account.value = null;
	}

	async function getAccount(): Promise<void> {
		try {
			const { data } = await axios.get<Account>("/api/account");
			setAccount(data);
		} catch (error) {
			clearAuth();
			throw new Error("Failed to fetch account information.");
		}
	}

	async function login(username: string, password: string): Promise<boolean> {
		try {
			await axios.post("/api/login", { username, password });
			await getAccount();
			return true;
		} catch (error) {
			clearAuth();
			const axiosError = error as AxiosError;
			if (axiosError.response?.status === 401) {
				throw new Error("Invalid credentials.");
			}
			throw new Error("Login failed.");
		}
	}

	async function logout(): Promise<void> {
		try {
			await axios.post("/api/logout");
		} finally {
			clearAuth();
		}
	}

	function hasAuthority(authority: string): boolean {
		return account.value?.authorities?.includes(authority) ?? false;
	}

	function hasAnyAuthority(authorities: string[]): boolean {
		return authorities.some((auth) => hasAuthority(auth));
	}

	return {
		account,
		isAuthenticated,
		login,
		logout,
		getAccount,
		hasAuthority,
		hasAnyAuthority,
	};
});
