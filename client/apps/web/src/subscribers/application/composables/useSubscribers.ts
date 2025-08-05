/**
 * Composable for using the subscribers store with automatic initialization
 * Provides convenient access to subscriber functionality
 */

import { computed } from "vue";
import type { FetchSubscribersFilters } from "../../domain/usecases";
import {
	getInitializedStore,
	safeInitializeSubscribersModule,
} from "../../infrastructure/di";

/**
 * Composable that provides access to the subscribers store
 * Automatically ensures the module is initialized
 * @returns Subscriber store instance and convenience methods
 */
export function useSubscribers() {
	// Ensure module is initialized
	safeInitializeSubscribersModule();

	// Get the initialized store
	const store = getInitializedStore();

	// Convenience computed properties
	const subscribers = computed(() => store.subscribers);
	const statusCounts = computed(() => store.statusCounts);
	const tagCounts = computed(() => store.tagCounts);
	const isLoading = computed(() => store.isLoading);
	const hasError = computed(() => store.hasError);
	const error = computed(() => store.error);
	const subscriberCount = computed(() => store.subscriberCount);

	// Convenience methods with error handling
	const fetchSubscribers = async (
		workspaceId: string,
		filters?: FetchSubscribersFilters,
	) => {
		try {
			await store.fetchSubscribers(workspaceId, filters);
		} catch (error) {
			console.error("Failed to fetch subscribers:", error);
			throw error;
		}
	};

	const fetchAllData = async (
		workspaceId: string,
		filters?: FetchSubscribersFilters,
	) => {
		try {
			await store.fetchAllData(workspaceId, filters);
		} catch (error) {
			console.error("Failed to fetch all subscriber data:", error);
			throw error;
		}
	};

	const refreshData = async (workspaceId: string) => {
		try {
			await store.refreshData(workspaceId);
		} catch (error) {
			console.error("Failed to refresh subscriber data:", error);
			throw error;
		}
	};

	const clearError = () => {
		store.clearError();
	};

	const resetState = () => {
		store.resetState();
	};

	return {
		// State
		subscribers,
		statusCounts,
		tagCounts,
		isLoading,
		hasError,
		error,
		subscriberCount,

		// Actions
		fetchSubscribers,
		fetchAllData,
		refreshData,
		clearError,
		resetState,

		// Direct store access for advanced usage
		store,
	};
}
