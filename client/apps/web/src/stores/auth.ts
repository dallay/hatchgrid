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
				// Only log errors in non-production environments
				if (process.env.NODE_ENV !== "production") {
					console.error("Login failed:", error);
				}
				throw error;
			}
		},

		async checkSession(): Promise<boolean> {
			try {
				await axios.post("/api/refresh-token", {}, { withCredentials: true });
				this.isAuthenticated = true;
				return true;
			} catch (error) {
				this.isAuthenticated = false;
				// Only log errors in non-production environments
				if (process.env.NODE_ENV !== "production") {
					console.error("Session check failed:", error);
				}
				throw error;
			}
		},

		async logout() {
			try {
				await axios.post("/api/logout", {}, { withCredentials: true });
				this.isAuthenticated = false;

				// Clear session validation cache on logout (skip in test environment)
				if (typeof window !== "undefined") {
					try {
						const { clearSessionCache } = await import("../router");
						clearSessionCache();
					} catch (error) {
						// Ignore router import errors in test environment
						if (process.env.NODE_ENV !== "production") {
							console.warn("Could not clear session cache:", error);
						}
					}
				}

				return true;
			} catch (error) {
				// Only log errors in non-production environments
				if (process.env.NODE_ENV !== "production") {
					console.error("Logout failed:", error);
				}
				throw error;
			}
		},
	},
});
