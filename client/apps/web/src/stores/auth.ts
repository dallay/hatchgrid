import axios from "axios";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		isAuthenticated: false,
	}),
	actions: {
		async login(username: string, password: string): Promise<boolean> {
			try {
				await axios.post(
					"/api/login",
					{ username, password },
					{ withCredentials: true },
				);
				this.isAuthenticated = true;
				return true;
			} catch (error) {
				this.isAuthenticated = false;
				console.error("Login failed:", error);
				throw error;
			}
		},

		async checkSession() {
			try {
				await axios.post("/api/refresh-token", {}, { withCredentials: true });
				this.isAuthenticated = true;
				return true;
			} catch (error) {
				this.isAuthenticated = false;
				console.error("Session check failed:", error);
				return false;
			}
		},

		async logout() {
			try {
				await axios.post("/api/logout", {}, { withCredentials: true });
				this.isAuthenticated = false;
				return true;
			} catch (error) {
				console.error("Logout failed:", error);
				throw error;
			}
		},
	},
});
