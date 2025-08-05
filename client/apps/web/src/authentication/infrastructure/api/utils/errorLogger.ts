import { isAxiosError } from "axios";

/**
 * Centralized error logging utility for API operations.
 * Provides consistent error logging across all API clients.
 */
export function logApiError(message: string, error: unknown): void {
	if (import.meta.env.DEV) {
		if (isAxiosError(error)) {
			console.error(`${message}:`, {
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data,
				url: error.config?.url,
				method: error.config?.method,
			});
		} else {
			console.error(`${message}:`, error);
		}
	}
}
