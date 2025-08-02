/**
 * HTTP client abstraction for workspace API operations.
 * Provides a testable interface for HTTP operations with built-in retry logic.
 */

import axios, { type AxiosError, type AxiosResponse } from "axios";

/**
 * Configuration options for HTTP requests
 */
export interface HttpRequestConfig {
	timeout?: number;
	maxRetries?: number;
	retryDelay?: number;
}

/**
 * HTTP client interface for dependency injection and testing
 */
export interface IHttpClient {
	get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}

/**
 * Default configuration for HTTP requests
 */
const DEFAULT_CONFIG: Required<HttpRequestConfig> = {
	timeout: 10000, // 10 seconds
	maxRetries: 3,
	retryDelay: 1000, // 1 second
};

/**
 * Determines if an error is retryable (transient failure)
 */
function isRetryableError(error: AxiosError): boolean {
	if (!error.response) {
		// Network errors (no response received)
		return true;
	}

	const status = error.response.status;
	// Retry on server errors (5xx) and rate limiting (429)
	return status >= 500 || status === 429;
}

/**
 * Implements exponential backoff delay calculation
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
	return baseDelay * 2 ** (attempt - 1);
}

/**
 * Axios-based HTTP client implementation with retry logic
 */
export class AxiosHttpClient implements IHttpClient {
	private readonly defaultConfig: Required<HttpRequestConfig>;

	constructor(config: HttpRequestConfig = {}) {
		this.defaultConfig = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Executes a GET request with retry logic and timeout handling.
	 *
	 * @param url - The URL to request
	 * @param config - Optional request configuration
	 * @returns Promise resolving to the response data
	 */
	async get<T>(url: string, config: HttpRequestConfig = {}): Promise<T> {
		const requestConfig = { ...this.defaultConfig, ...config };
		let lastError: AxiosError | Error = new Error("Unknown error");

		for (let attempt = 1; attempt <= requestConfig.maxRetries; attempt++) {
			try {
				const response: AxiosResponse<T> = await axios.get(url, {
					timeout: requestConfig.timeout,
				});
				return response.data;
			} catch (error) {
				lastError = error as AxiosError | Error;

				// Don't retry on the last attempt
				if (attempt === requestConfig.maxRetries) {
					break;
				}

				// Only retry if it's a retryable error
				if (axios.isAxiosError(error) && isRetryableError(error)) {
					const delay = calculateRetryDelay(attempt, requestConfig.retryDelay);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}

				// Non-retryable error, throw immediately
				break;
			}
		}

		// Handle the final error
		if (axios.isAxiosError(lastError)) {
			const status = lastError.response?.status;
			const message = lastError.response?.data?.message || lastError.message;

			throw new Error(`HTTP GET ${url} (${status}): ${message}`);
		}

		throw new Error(
			`HTTP GET ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
		);
	}
}
