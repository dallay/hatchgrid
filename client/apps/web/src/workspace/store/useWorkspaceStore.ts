/**
 * Pinia store for workspace state management
 * Follows clean architecture principles with dependency injection
 */

import { defineStore } from "pinia";
import { computed, type Ref, readonly, ref } from "vue";
import type { CollectionResponse, SingleItemResponse } from "@/shared";
import type { Workspace } from "../domain/models";
import { isValidUUID } from "../domain/models/WorkspaceValidation";
import type { GetWorkspaceById, ListWorkspaces } from "../domain/use-cases";
import type { WorkspaceStorage } from "../infrastructure";

/**
 * Error state interface for consistent error handling
 */
export interface WorkspaceError {
	readonly message: string;
	readonly code?: string;
	readonly timestamp: Date;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
	readonly loadingAll: boolean;
	readonly loadingById: boolean;
}

import { LRUCache } from "@/cache/lru.cache";

/**
 * Cache configuration options
 */
export interface CacheConfig {
	readonly workspaceListTtl: number; // TTL for workspace list cache
	readonly workspaceDetailsTtl: number; // TTL for individual workspace details
	readonly maxCacheSize: number; // Maximum number of cached workspace details
}

/**
 * Store state interface for type safety
 */
export interface WorkspaceStoreState {
	readonly workspaces: Workspace[];
	readonly currentWorkspace: Workspace | null;
	readonly loading: LoadingStates;
	readonly error: WorkspaceError | null;
}

/**
 * Default loading states
 */
const defaultLoadingStates: LoadingStates = {
	loadingAll: false,
	loadingById: false,
};

/**
 * Use case dependencies interface for dependency injection
 */
export interface WorkspaceUseCases {
	readonly listWorkspaces: ListWorkspaces;
	readonly getWorkspaceById: GetWorkspaceById;
}

/**
 * Store dependencies interface for dependency injection
 */
export interface WorkspaceStoreDependencies {
	readonly useCases: WorkspaceUseCases;
	readonly storage: WorkspaceStorage;
	readonly cacheConfig?: CacheConfig;
}

/**
 * Default cache configuration
 */
const defaultCacheConfig: CacheConfig = {
	workspaceListTtl: 5 * 60 * 1000, // 5 minutes
	workspaceDetailsTtl: 10 * 60 * 1000, // 10 minutes
	maxCacheSize: 50, // Maximum 50 cached workspace details
};

/**
 * Factory function to create workspace store with dependency injection
 * This approach ensures type safety and prevents race conditions
 */
export const createWorkspaceStore = (
	dependencies: WorkspaceStoreDependencies,
) => {
	const { useCases, storage, cacheConfig = defaultCacheConfig } = dependencies;
	return defineStore("workspace", () => {
		// Reactive state
		const workspaces: Ref<Workspace[]> = ref([]);
		const currentWorkspace: Ref<Workspace | null> = ref(null);
		const loading: Ref<LoadingStates> = ref({ ...defaultLoadingStates });
		const error: Ref<WorkspaceError | null> = ref(null);

		// Cache state
		const workspaceListCache = new LRUCache<Workspace[]>({
			ttl: cacheConfig.workspaceListTtl,
			maxSize: 1, // Only one list of workspaces
		});

		const workspaceDetailsCache = new LRUCache<Workspace>({
			ttl: cacheConfig.workspaceDetailsTtl,
			maxSize: cacheConfig.maxCacheSize,
		});

		// Computed getters
		const isLoading = computed(
			() => loading.value.loadingAll || loading.value.loadingById,
		);

		const hasError = computed(() => error.value !== null);

		const workspaceCount = computed(() => workspaces.value?.length || 0);

		const isWorkspaceSelected = computed(() => currentWorkspace.value !== null);

		// Memoized workspace lookup map for better performance
		const workspaceMap = computed(() => {
			return new Map(
				workspaces.value.map((workspace) => [workspace.id, workspace]),
			);
		});

		const workspaceById = computed(() => {
			return (id: string): Workspace | undefined => {
				return workspaceMap.value.get(id);
			};
		});

		// Error handling utilities
		const errorUtils = {
			create: (message: string, code?: string): WorkspaceError => ({
				message,
				code,
				timestamp: new Date(),
			}),
			clear: () => {
				error.value = null;
			},
			set: (err: WorkspaceError) => {
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

		// Cache utilities
		const cacheUtils = {
			getCachedWorkspaceList: (): Workspace[] | undefined => {
				return workspaceListCache.get("all");
			},
			setCachedWorkspaceList: (workspaces: Workspace[]): void => {
				workspaceListCache.set("all", workspaces);
			},
			getCachedWorkspaceDetails: (id: string): Workspace | undefined => {
				return workspaceDetailsCache.get(id);
			},
			setCachedWorkspaceDetails: (workspace: Workspace): void => {
				workspaceDetailsCache.set(workspace.id, workspace);
			},
			invalidateWorkspaceList: (): void => {
				workspaceListCache.delete("all");
			},
			invalidateWorkspaceDetails: (id: string | string[]): void => {
				const ids = Array.isArray(id) ? id : [id];
				for (const anId of ids) {
					workspaceDetailsCache.delete(anId);
				}
			},
			invalidateAll: (): void => {
				workspaceListCache.clear();
				workspaceDetailsCache.clear();
			},
			getStats: () => ({
				workspaceList: workspaceListCache.getStats(),
				workspaceDetails: workspaceDetailsCache.getStats(),
			}),
		};

		// UUID validation is now imported from the domain validation utility

		// Reset store state
		const resetState = () => {
			workspaces.value = [];
			currentWorkspace.value = null;
			loadingUtils.reset();
			errorUtils.clear();
			cacheUtils.invalidateAll();
		};

		// Higher-order function to handle common action patterns
		const withAsyncAction = async <T>(
			loadingKey: keyof LoadingStates,
			operation: () => Promise<T>,
			onSuccess: (result: T) => void,
			errorCode: string,
			defaultErrorMessage: string,
		): Promise<void> => {
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
		const loadAll = async (forceRefresh = false): Promise<void> => {
			// Check cache first if not forcing refresh
			if (!forceRefresh) {
				const cachedWorkspaces = cacheUtils.getCachedWorkspaceList();
				if (cachedWorkspaces) {
					workspaces.value = cachedWorkspaces;
					errorUtils.clear();
					return;
				}
			}

			// If forcing refresh, invalidate cache
			if (forceRefresh) {
				cacheUtils.invalidateWorkspaceList();
			}

			await withAsyncAction(
				"loadingAll",
				() => useCases.listWorkspaces.execute(),
				(result: CollectionResponse<Workspace>) => {
					workspaces.value = result.data;
					// Cache the result
					cacheUtils.setCachedWorkspaceList(result.data);
				},
				"LOAD_ALL_WORKSPACES_ERROR",
				"Failed to load workspaces",
			);
		};

		const selectWorkspace = async (
			id: string,
			persist = true,
		): Promise<void> => {
			// Validate workspace ID format before calling use case
			if (!id || id.trim() === "") {
				errorUtils.set(
					errorUtils.create("Workspace ID is required", "INVALID_WORKSPACE_ID"),
				);
				return;
			}

			if (!isValidUUID(id)) {
				errorUtils.set(
					errorUtils.create(
						"Invalid workspace ID format",
						"INVALID_UUID_FORMAT",
					),
				);
				return;
			}

			// Check workspace details cache first
			const cachedWorkspaceDetails = cacheUtils.getCachedWorkspaceDetails(id);
			if (cachedWorkspaceDetails) {
				currentWorkspace.value = cachedWorkspaceDetails;
				errorUtils.clear();

				// Also update the workspace list if not present
				if (!workspaces.value.some((w) => w.id === cachedWorkspaceDetails.id)) {
					workspaces.value = [...workspaces.value, cachedWorkspaceDetails];
				}

				// Persist selection if requested
				if (persist) {
					try {
						storage.setSelectedWorkspaceId(id);
					} catch (err) {
						console.warn("Failed to persist workspace selection:", err);
					}
				}
				return;
			}

			// Check if workspace is in the workspace list cache
			const cachedWorkspace = workspaceById.value(id);
			if (cachedWorkspace) {
				currentWorkspace.value = cachedWorkspace;
				errorUtils.clear();

				// Cache the workspace details
				cacheUtils.setCachedWorkspaceDetails(cachedWorkspace);

				// Persist selection if requested
				if (persist) {
					try {
						storage.setSelectedWorkspaceId(id);
					} catch (err) {
						console.warn("Failed to persist workspace selection:", err);
					}
				}
				return;
			}

			await withAsyncAction(
				"loadingById",
				() => useCases.getWorkspaceById.execute(id),
				(result: SingleItemResponse<Workspace> | null) => {
					if (result) {
						currentWorkspace.value = result.data;

						// Cache the workspace details
						cacheUtils.setCachedWorkspaceDetails(result.data);

						// Add to workspace list if not already present
						if (!workspaces.value.some((w) => w.id === result.data.id)) {
							workspaces.value = [...workspaces.value, result.data];
						}

						// Persist selection if requested
						if (persist) {
							try {
								storage.setSelectedWorkspaceId(id);
							} catch (err) {
								console.warn("Failed to persist workspace selection:", err);
							}
						}
					} else {
						currentWorkspace.value = null;
						errorUtils.set(
							errorUtils.create(
								`Workspace not found: ${id}`,
								"WORKSPACE_NOT_FOUND",
							),
						);
					}
				},
				"SELECT_WORKSPACE_ERROR",
				`Failed to select workspace: ${id}`,
			);
		};

		/**
		 * Restores workspace selection from localStorage
		 * Handles cases where persisted workspace is no longer accessible
		 */
		const restorePersistedWorkspace = async (): Promise<boolean> => {
			try {
				const persistedId = storage.getSelectedWorkspaceId();

				if (!persistedId) {
					return false;
				}

				// Try to select the persisted workspace without persisting again
				await selectWorkspace(persistedId, false);

				// Check if selection was successful
				if (currentWorkspace.value?.id === persistedId) {
					return true;
				}
				// Workspace no longer accessible, clear from storage
				storage.clearSelectedWorkspaceId();
				return false;
			} catch (err) {
				console.warn("Failed to restore persisted workspace:", err);
				// Clear invalid persisted data
				storage.clearSelectedWorkspaceId();
				return false;
			}
		};

		/**
		 * Clears the current workspace selection and removes from persistence
		 */
		const clearWorkspaceSelection = (): void => {
			currentWorkspace.value = null;
			storage.clearSelectedWorkspaceId();
			errorUtils.clear();
		};

		/**
		 * Gets the persisted workspace ID without loading it
		 */
		const getPersistedWorkspaceId = (): string | null => {
			return storage.getSelectedWorkspaceId();
		};

		/**
		 * Checks if there is a persisted workspace selection
		 */
		const hasPersistedWorkspace = (): boolean => {
			return storage.hasPersistedWorkspace();
		};

		/**
		 * Invalidates workspace cache entries
		 * Useful when workspace data is updated externally
		 */
		const invalidateCache = (options?: {
			workspaceList?: boolean;
			workspaceDetails?: string | string[];
			all?: boolean;
		}): void => {
			if (options?.all) {
				cacheUtils.invalidateAll();
				workspaces.value = [];
				return;
			}

			if (options?.workspaceList) {
				cacheUtils.invalidateWorkspaceList();
				workspaces.value = [];
			}

			if (options?.workspaceDetails) {
				const idsToInvalidate = Array.isArray(options.workspaceDetails)
					? options.workspaceDetails
					: [options.workspaceDetails];
				cacheUtils.invalidateWorkspaceDetails(idsToInvalidate);
				workspaces.value = workspaces.value.filter(
					(w) => !idsToInvalidate.includes(w.id),
				);
			}
		};

		/**
		 * Gets cache statistics for debugging and monitoring
		 */
		const getCacheStats = () => cacheUtils.getStats();

		/**
		 * Manually cleans up expired cache entries
		 * Called automatically during normal operations
		 */
		const cleanupExpiredCache = (): void => {
			workspaceListCache.prune();
			workspaceDetailsCache.prune();
		};

		/**
		 * Test helper to clear current workspace without affecting cache
		 * Only for testing purposes
		 */
		const clearCurrentWorkspaceForTesting = (): void => {
			currentWorkspace.value = null;
		};

		return {
			// State
			workspaces: readonly(workspaces),
			currentWorkspace: readonly(currentWorkspace),
			loading: readonly(loading),
			error: readonly(error),

			// Computed
			isLoading,
			hasError,
			workspaceCount,
			isWorkspaceSelected,
			workspaceById,

			// Actions
			resetState,
			clearError: errorUtils.clear,
			loadAll,
			selectWorkspace,
			restorePersistedWorkspace,
			clearWorkspaceSelection,
			getPersistedWorkspaceId,
			hasPersistedWorkspace,

			// Cache management
			invalidateCache,
			getCacheStats,
			cleanupExpiredCache,

			// Test helpers
			clearCurrentWorkspaceForTesting,
		};
	});
};

/**
 * Default workspace store instance (for backward compatibility)
 * In production, use createWorkspaceStore with proper dependency injection
 */
export const useWorkspaceStore = () => {
	throw new Error(
		"useWorkspaceStore must be created using createWorkspaceStore with proper dependencies",
	);
};

/**
 * Type for the workspace store instance
 */
export type WorkspaceStore = ReturnType<
	ReturnType<typeof createWorkspaceStore>
>;
