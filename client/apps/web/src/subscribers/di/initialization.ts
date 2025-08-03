/**
 * Initialization module for the subscribers feature
 * Handles store initialization with proper dependency injection
 */

import { useSubscriberStore } from "../store/subscriber.store";
import { createUseCases } from "./container";

/**
 * Initialization state tracking
 */
let isInitialized = false;

/**
 * Initialize the subscribers module with dependency injection
 * This function should be called once during application startup
 * @throws Error if already initialized
 */
export function initializeSubscribersModule(): void {
	if (isInitialized) {
		throw new Error("Subscribers module has already been initialized");
	}

	try {
		// Create use cases with injected dependencies
		const useCases = createUseCases();

		// Initialize the store with use cases
		const store = useSubscriberStore();
		store.initializeStore(useCases);

		isInitialized = true;
	} catch (error) {
		throw new Error(
			`Failed to initialize subscribers module: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Check if the subscribers module has been initialized
 * @returns true if initialized, false otherwise
 */
export function isSubscribersModuleInitialized(): boolean {
	return isInitialized;
}

/**
 * Reset initialization state (useful for testing)
 * This function should only be used in test environments
 */
export function resetInitialization(): void {
	isInitialized = false;
}

/**
 * Get initialized store instance
 * @throws Error if module is not initialized
 * @returns Initialized subscriber store
 */
export function getInitializedStore() {
	if (!isInitialized) {
		throw new Error(
			"Subscribers module must be initialized before accessing the store",
		);
	}

	return useSubscriberStore();
}

/**
 * Safe initialization that won't throw if already initialized
 * Useful for components that might be loaded multiple times
 */
export function safeInitializeSubscribersModule(): void {
	if (!isInitialized) {
		initializeSubscribersModule();
	}
}

/**
 * Initialization options for advanced configuration
 */
export interface InitializationOptions {
	readonly skipIfInitialized?: boolean;
	readonly onSuccess?: () => void;
	readonly onError?: (error: Error) => void;
}

/**
 * Initialize with options and callbacks
 * @param options - Initialization options
 */
export function initializeWithOptions(
	options: InitializationOptions = {},
): void {
	const { skipIfInitialized = false, onSuccess, onError } = options;

	if (isInitialized && skipIfInitialized) {
		onSuccess?.();
		return;
	}

	try {
		initializeSubscribersModule();
		onSuccess?.();
	} catch (error) {
		const errorInstance =
			error instanceof Error
				? error
				: new Error("Unknown initialization error");
		onError?.(errorInstance);
		throw errorInstance;
	}
}
