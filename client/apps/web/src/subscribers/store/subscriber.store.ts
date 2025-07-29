/**
 * Pinia store for subscriber state management
 * Follows clean architecture principles with dependency injection
 */

import { defineStore } from "pinia";
import { computed, type Ref, readonly, ref } from "vue";
import type {
	CountByStatusResponse,
	CountByTagsResponse,
	Subscriber,
	SubscriberStatus,
} from "../domain/models";
import type {
	CountByStatus,
	CountByTags,
	FetchSubscribers,
	FetchSubscribersFilters,
} from "../domain/usecases";

/**
 * Error state interface for consistent error handling
 */
export interface SubscriberError {
	readonly message: string;
	readonly code?: string;
	readonly timestamp: Date;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
	readonly fetchingSubscribers: boolean;
	readonly countingByStatus: boolean;
	readonly countingByTags: boolean;
}

/**
 * Store state interface for type safety
 */
export interface SubscriberStoreState {
	readonly subscribers: Subscriber[];
	readonly statusCounts: CountByStatusResponse[];
	readonly tagCounts: CountByTagsResponse[];
	readonly loading: LoadingStates;
	readonly error: SubscriberError | null;
	readonly lastFetchFilters: FetchSubscribersFilters | null;
}

/**
 * Default loading states
 */
const defaultLoadingStates: LoadingStates = {
	fetchingSubscribers: false,
	countingByStatus: false,
	countingByTags: false,
};

/**
 * Use case dependencies interface for dependency injection
 */
export interface SubscriberUseCases {
	readonly fetchSubscribers: FetchSubscribers;
	readonly countByStatus: CountByStatus;
	readonly countByTags: CountByTags;
}

/**
 * Subscriber store with dependency injection
 * Manages reactive state for subscribers, loading states, and error handling
 * Delegates business logic to domain use cases
 */
export const useSubscriberStore = defineStore("subscriber", () => {
	// Reactive state
	const subscribers: Ref<Subscriber[]> = ref([]);
	const statusCounts: Ref<CountByStatusResponse[]> = ref([]);
	const tagCounts: Ref<CountByTagsResponse[]> = ref([]);
	const loading: Ref<LoadingStates> = ref({ ...defaultLoadingStates });
	const error: Ref<SubscriberError | null> = ref(null);
	const lastFetchFilters: Ref<FetchSubscribersFilters | null> = ref(null);

	// Injected use cases (will be set during store initialization)
	let useCases: SubscriberUseCases | null = null;

	// Computed getters
	const isLoading = computed(
		() =>
			loading.value.fetchingSubscribers ||
			loading.value.countingByStatus ||
			loading.value.countingByTags,
	);

	const hasError = computed(() => error.value !== null);

	const subscriberCount = computed(() => subscribers.value?.length || 0);

	const totalStatusCount = computed(
		() =>
			statusCounts.value?.reduce((total, count) => total + count.count, 0) || 0,
	);

	const totalTagCount = computed(
		() =>
			tagCounts.value?.reduce((total, count) => total + count.count, 0) || 0,
	);

	const isAnyDataLoaded = computed(
		() =>
			subscribers.value.length > 0 ||
			statusCounts.value.length > 0 ||
			tagCounts.value.length > 0,
	);

	// Error handling utilities
	const errorUtils = {
		create: (message: string, code?: string): SubscriberError => ({
			message,
			code,
			timestamp: new Date(),
		}),
		clear: () => {
			error.value = null;
		},
		set: (err: SubscriberError) => {
			error.value = err;
		},
	};

	// Loading state utilities
	const loadingUtils = {
		set: (key: keyof LoadingStates, value: boolean) => {
			loading.value = { ...loading.value, [key]: value };
		},
		reset: () => {
			loading.value = { ...defaultLoadingStates };
		},
	};

	// Store initialization with dependency injection
	const initializeStore = (injectedUseCases: SubscriberUseCases) => {
		if (useCases !== null) {
			throw new Error("Store has already been initialized");
		}
		useCases = injectedUseCases;
	};

	// Validation helper
	const ensureInitialized = () => {
		if (useCases === null) {
			throw new Error("Store must be initialized with use cases before use");
		}
	};

	// Reset store state
	const resetState = () => {
		subscribers.value = [];
		statusCounts.value = [];
		tagCounts.value = [];
		loadingUtils.reset();
		errorUtils.clear();
		lastFetchFilters.value = null;
	};

	// Higher-order function to handle common action patterns
	const withAsyncAction = async <T>(
		loadingKey: keyof LoadingStates,
		operation: () => Promise<T>,
		onSuccess: (result: T) => void,
		errorCode: string,
		defaultErrorMessage: string,
		workspaceId: string,
	): Promise<void> => {
		ensureInitialized();

		if (!workspaceId || workspaceId.trim() === "") {
			errorUtils.set(
				errorUtils.create("Workspace ID is required", "INVALID_WORKSPACE_ID"),
			);
			return;
		}

		loadingUtils.set(loadingKey, true);
		errorUtils.clear();

		try {
			const result = await operation();
			onSuccess(result);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : defaultErrorMessage;
			errorUtils.set(errorUtils.create(errorMessage, errorCode));
		} finally {
			loadingUtils.set(loadingKey, false);
		}
	};

	// Store actions with use case injection
	const fetchSubscribers = async (
		workspaceId: string,
		filters?: FetchSubscribersFilters,
	): Promise<void> => {
		await withAsyncAction(
			"fetchingSubscribers",
			() =>
				useCases?.fetchSubscribers.execute(workspaceId, filters) ??
				Promise.resolve([]),
			(result) => {
				subscribers.value = result;
				lastFetchFilters.value = filters || null;
			},
			"FETCH_SUBSCRIBERS_ERROR",
			"Failed to fetch subscribers",
			workspaceId,
		);
	};

	const countByStatus = async (workspaceId: string): Promise<void> => {
		await withAsyncAction(
			"countingByStatus",
			() => useCases?.countByStatus.execute(workspaceId) ?? Promise.resolve([]),
			(result) => {
				statusCounts.value = result;
			},
			"COUNT_BY_STATUS_ERROR",
			"Failed to count subscribers by status",
			workspaceId,
		);
	};

	const countByTags = async (workspaceId: string): Promise<void> => {
		await withAsyncAction(
			"countingByTags",
			() => useCases?.countByTags.execute(workspaceId) ?? Promise.resolve([]),
			(result) => {
				tagCounts.value = result;
			},
			"COUNT_BY_TAGS_ERROR",
			"Failed to count subscribers by tags",
			workspaceId,
		);
	};

	// Convenience action to fetch all data at once
	const fetchAllData = async (
		workspaceId: string,
		filters?: FetchSubscribersFilters,
	): Promise<void> => {
		ensureInitialized();
		validateWorkspaceId(workspaceId);

		// Execute all operations concurrently for better performance
		await Promise.allSettled([
			fetchSubscribers(workspaceId, filters),
			countByStatus(workspaceId),
			countByTags(workspaceId),
		]);
	};

	// Refresh current data using last filters
	const refreshData = async (workspaceId: string): Promise<void> => {
		ensureInitialized();
		validateWorkspaceId(workspaceId);

		await fetchAllData(workspaceId, lastFetchFilters.value || undefined);
	};

	// Validation helper for workspace ID
	const validateWorkspaceId = (workspaceId: string): void => {
		if (!workspaceId || workspaceId.trim() === "") {
			throw new Error("Workspace ID is required");
		}
	};

	// Get specific status count (convenience method)
	const getStatusCount = async (
		workspaceId: string,
		status: SubscriberStatus,
	): Promise<number> => {
		ensureInitialized();
		validateWorkspaceId(workspaceId);

		try {
			const result = await useCases?.countByStatus.getCountForStatus(
				workspaceId,
				status,
			);
			return result || 0;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get status count";
			errorUtils.set(errorUtils.create(errorMessage, "GET_STATUS_COUNT_ERROR"));
			return 0;
		}
	};

	// Get specific tag count (convenience method)
	const getTagCount = async (
		workspaceId: string,
		tag: string,
	): Promise<number> => {
		ensureInitialized();
		validateWorkspaceId(workspaceId);

		try {
			const result = await useCases?.countByTags.getCountForTag(
				workspaceId,
				tag,
			);
			return result || 0;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get tag count";
			errorUtils.set(errorUtils.create(errorMessage, "GET_TAG_COUNT_ERROR"));
			return 0;
		}
	};

	// Get top tags (convenience method)
	const getTopTags = async (
		workspaceId: string,
		limit = 10,
	): Promise<CountByTagsResponse[]> => {
		ensureInitialized();
		validateWorkspaceId(workspaceId);

		try {
			const result = await useCases?.countByTags.getTopTags(workspaceId, limit);
			return result || [];
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get top tags";
			errorUtils.set(errorUtils.create(errorMessage, "GET_TOP_TAGS_ERROR"));
			return [];
		}
	};

	return {
		// State
		subscribers: readonly(subscribers),
		statusCounts: readonly(statusCounts),
		tagCounts: readonly(tagCounts),
		loading: readonly(loading),
		error: readonly(error),
		lastFetchFilters: readonly(lastFetchFilters),

		// Computed
		isLoading,
		hasError,
		subscriberCount,
		totalStatusCount,
		totalTagCount,
		isAnyDataLoaded,

		// Actions
		initializeStore,
		resetState,
		clearError: errorUtils.clear,
		fetchSubscribers,
		countByStatus,
		countByTags,
		fetchAllData,
		refreshData,
		getStatusCount,
		getTagCount,
		getTopTags,
	};
});

/**
 * Type for the subscriber store instance
 */
export type SubscriberStore = ReturnType<typeof useSubscriberStore>;
