import axios, { type AxiosError } from "axios";
import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function setupAxiosInterceptors(router: Router) {
  axios.interceptors.request.use((config) => {
    console.log('Intercepting request:', config.url);
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
      console.log('Found XSRF token:', xsrfToken);
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
    } else {
      console.log('No XSRF token found');
    }
    return config;
  });

	axios.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			const store = useAuthStore();
			const status = error.response?.status;

			if (status === 401) {
				store.logout();
				router.push({ name: "Login" });
			} else if (status === 403) {
				router.push({ name: "Forbidden" });
			}

			return Promise.reject(error);
		},
	);
}
