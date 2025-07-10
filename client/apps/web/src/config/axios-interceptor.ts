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

			// Removed token from localStorage/sessionStorage as requested

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
				// If the original request was to /api/account, we've already tried to get the account and failed.
				// Rejecting will prevent an infinite loop and allow the original caller to handle the error.
				if (url?.endsWith("api/account")) {
					return Promise.reject(error);
				}

				// For any other 401, try to get the account to see if the session is truly expired.
				axios.get("/api/account").catch((innerError) => {
					// If getting the account also results in a 401, the session is invalid.
					if (innerError.response?.status === 401) {
						store.logout();
						// Redirect to login unless we are on an auth page already.
						if (
							!url?.endsWith("api/authenticate") &&
							currentRoute.name !== "Login"
						) {
							router.push({
								name: "Login",
								query: { redirect: currentRoute.fullPath },
							});
						}
					}
				});
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
