import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";

function getCookie(name: string): string | undefined {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : undefined;
}

export function setupAxiosInterceptors(router: Router) {
	// Request interceptor for XSRF protection
	axios.interceptors.request.use(
		(config) => {
			console.log("Intercepting request:", config.url);

			// Add XSRF token for non-GET requests
			if (config.method && config.method.toLowerCase() !== "get") {
				const xsrfToken = getCookie("XSRF-TOKEN");
				if (xsrfToken) {
					console.log("Found XSRF token:", xsrfToken);
					config.headers["X-XSRF-TOKEN"] = xsrfToken;
				} else {
					console.log("No XSRF token found");
				}
			}

			// Add authentication token if available
			const token =
				localStorage.getItem("jhi-authenticationToken") ||
				sessionStorage.getItem("jhi-authenticationToken");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			return config;
		},
		(error) => {
			console.error("Request interceptor error:", error);
			return Promise.reject(error);
		},
	);

	// Response interceptor for error handling
	axios.interceptors.response.use(
		(response: AxiosResponse) => {
			// Log successful responses in development
			console.log("Response received:", response.status, response.config.url);
			return response;
		},
		(error: AxiosError) => {
			const store = useAuthStore();
			const status = error.response?.status;
			const url = error.response?.config?.url;

			console.error("Response error:", status, url, error.message);

			// Patch: Provide a default currentRoute for router in tests
			// so router.currentRoute.value.name does not throw
			const currentRoute: { name?: string; fullPath?: string } = (
				router as Router & {
					currentRoute?: { value?: { name?: string; fullPath?: string } };
				}
			).currentRoute?.value || { name: undefined, fullPath: undefined };

			if (status === 401) {
				store.logout();
				localStorage.removeItem("jhi-authenticationToken");
				sessionStorage.removeItem("jhi-authenticationToken");
				if (
					!url?.endsWith("api/account") &&
					!url?.endsWith("api/authenticate") &&
					currentRoute.name !== "Login"
				) {
					router.push({
						name: "Login",
						query: { redirect: currentRoute.fullPath },
					});
				}
			} else if (status === 403) {
				if (currentRoute.name !== "Forbidden") {
					router.push({ name: "Forbidden" });
				}
			} else if (status === 0 || status === 504) {
				console.error("Network error or server unavailable");
			}

			return Promise.reject(error);
		},
	);
}
