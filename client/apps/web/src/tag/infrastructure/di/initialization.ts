/**
 * Initialization module for the tags feature
 * Handles store initialization with proper dependency injection
 */

import type { TagStore } from "../store/tag.store.ts";
import { createUseCases } from "./container.ts";

/**
 * Store factory type for dependency injection
 */
type StoreFactory = () => TagStore;

/**
 * Initialization state tracking
 */
let isInitialized = false;
let storeFactory: StoreFactory | null = null;

/**
 * Configure the store factory for dependency injection
 * @param factory - Function that returns the store instance
 */
export function configureStoreFactory(factory: StoreFactory): void {
	storeFactory = factory;
}

/**
 * Initialize the tags module with dependency injection
 * This function should be called once during application startup
 * @throws Error if already initialized or store factory not configured
 */
export function initializeTagsModule(): void {
	if (isInitialized) {
		throw new Error("Tags module has already been initialized");
	}

	if (!storeFactory) {
		throw new Error("Store factory must be configured before initialization");
	}

	try {
		// Create use cases with injected dependencies
		const useCases = createUseCases();

		// Initialize the store with use cases using the injected factory
		const store = storeFactory();
		store.initializeStore(useCases);

		isInitialized = true;
	} catch (error) {
		throw new Error(
			`Failed to initialize tags module: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Check if the tags module has been initialized
 * @returns true if initialized, false otherwise
 */
export function isTagsModuleInitialized(): boolean {
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
 * @throws Error if module is not initialized or store factory not configured
 * @returns Initialized tag store
 */
export function getInitializedStore() {
	if (!isInitialized) {
		throw new Error(
			"Tags module must be initialized before accessing the store",
		);
	}

	if (!storeFactory) {
		throw new Error(
			"Store factory must be configured before accessing the store",
		);
	}

	return storeFactory();
}

/**
 * Safe initialization that won't throw if already initialized
 * Useful for components that might be loaded multiple times
 */
export function safeInitializeTagsModule(): void {
	if (!isInitialized) {
		initializeTagsModule();
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
		initializeTagsModule();
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
