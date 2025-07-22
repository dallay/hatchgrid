import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";

function getCookie(name: string): string | undefined {
	const match = RegExp(new RegExp(`(^| )${name}=([^;]+)`)).exec(
		document.cookie,
	);
	return match ? decodeURIComponent(match[2]) : undefined;
}

export function setupAxiosInterceptors(router: Router) {
	axios.interceptors.request.use(
		(config) => {
			if (config.method && config.method.toLowerCase() !== "get") {
				const xsrfToken = getCookie("XSRF-TOKEN");
				if (xsrfToken) {
					config.headers["X-XSRF-TOKEN"] = xsrfToken;
				}
			}
			return config;
		},
		(error) => {
			console.error("Request interceptor error:", error);
			return Promise.reject(
				error instanceof Error ? error : new Error(String(error)),
			);
		},
	);

	axios.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		(error: AxiosError) => {
			const store = useAuthStore();
			const status = error.response?.status;
			const url = error.response?.config?.url;

			const currentRoute: { name?: string; fullPath?: string } = (
				router as Router & {
					currentRoute?: { value?: { name?: string; fullPath?: string } };
				}
			).currentRoute?.value || { name: undefined, fullPath: undefined };

			if (status === 401) {
				if (url?.endsWith("api/account")) {
					return Promise.reject(error);
				}
				return axios.get("/api/account").catch((innerError) => {
					if (innerError.response?.status === 401) {
						store.logout();
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
					return Promise.reject(error);
				});
			}
			if (status === 403 && currentRoute.name !== "Forbidden") {
				router.push({ name: "Forbidden" });
				return Promise.reject(error);
			}
			return Promise.reject(error);
		},
	);
}
