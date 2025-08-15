/**
 * Pinia store for tag state management
 * Follows clean architecture principles with dependency injection
 */

import { defineStore } from "pinia";
import { computed, type Ref, readonly, ref } from "vue";
import { useWorkspaceStoreProvider } from "@/workspace/infrastructure/providers/workspaceStoreProvider";
import type { Tag } from "../../domain/models";
import type {
	CreateTagData,
	TagUseCases,
	UpdateTagData,
} from "../../domain/usecases";

/**
 * Error state interface for consistent error handling
 */
export interface TagError {
	readonly message: string;
	readonly code?: string;
	readonly timestamp: Date;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
	readonly fetch: boolean;
	readonly create: boolean;
	readonly update: boolean;
	readonly delete: boolean;
}

/**
 * Store state interface for type safety
 */
export interface TagStoreState {
	readonly tags: Tag[];
	readonly loading: LoadingStates;
	readonly error: TagError | null;
}

/**
 * Default loading states
 */
const defaultLoadingStates: LoadingStates = {
	fetch: false,
	create: false,
	update: false,
	delete: false,
};

/**
 * Tag store with dependency injection
 * Manages reactive state for tags, loading states, and error handling
 * Delegates business logic to domain use cases
 */
export const useTagStore = defineStore("tag", () => {
	// Reactive state
	const tags: Ref<Tag[]> = ref([]);
	const loading: Ref<LoadingStates> = ref({ ...defaultLoadingStates });
	const error: Ref<TagError | null> = ref(null);

	// Injected use cases (will be set during store initialization)
	let useCases: TagUseCases | null = null;

	// Computed getters
	const isLoading = computed(
		() =>
			loading.value.fetch ||
			loading.value.create ||
			loading.value.update ||
			loading.value.delete,
	);

	const hasError = computed(() => error.value !== null);

	const tagCount = computed(() => tags.value?.length || 0);

	const isDataLoaded = computed(() => tags.value.length > 0);

	// Error handling utilities
	const errorUtils = {
		create: (message: string, code?: string): TagError => ({
			message,
			code,
			timestamp: new Date(),
		}),
		clear: () => {
			error.value = null;
		},
		set: (err: TagError) => {
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
	const initializeStore = (injectedUseCases: TagUseCases) => {
		if (useCases !== null && process.env.NODE_ENV !== "test") {
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
		tags.value = [];
		loadingUtils.reset();
		errorUtils.clear();
	};

	// Higher-order function to handle common action patterns
	const withAsyncAction = async <T>(
		loadingKey: keyof LoadingStates,
		operation: () => Promise<T>,
		onSuccess: (result: T) => void,
		errorCode: string,
		defaultErrorMessage: string,
	): Promise<void> => {
		ensureInitialized();

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
	const fetchTags = async (): Promise<void> => {
		const workspaceStore = useWorkspaceStoreProvider()();
		const workspaceId = workspaceStore.currentWorkspace?.id ?? "";
		await withAsyncAction(
			"fetch",
			() => useCases?.fetchTags.execute(workspaceId) ?? Promise.resolve([]),
			(result) => {
				tags.value = result as Tag[];
			},
			"FETCH_TAGS_ERROR",
			"Failed to fetch tags",
		);
	};

	const createTag = async (tagData: CreateTagData): Promise<Tag> => {
		let createdTag: Tag | null = null;

		const workspaceStore = useWorkspaceStoreProvider()();
		const workspaceId = workspaceStore.currentWorkspace?.id ?? "";

		await withAsyncAction(
			"create",
			() =>
				useCases?.createTag.execute(workspaceId, tagData) ??
				Promise.resolve(null),
			(result) => {
				if (result) {
					createdTag = result as Tag;
					tags.value = [...tags.value, createdTag];
				}
			},
			"CREATE_TAG_ERROR",
			"Failed to create tag",
		);

		if (!createdTag) {
			throw new Error("Failed to create tag: No result returned from use case");
		}

		return createdTag;
	};

	const updateTag = async (
		id: string,
		tagData: UpdateTagData,
	): Promise<Tag> => {
		let updatedTag: Tag | null = null;

		await withAsyncAction(
			"update",
			() => {
				const workspaceStore = useWorkspaceStoreProvider()();
				const workspaceId = workspaceStore.currentWorkspace?.id ?? "";
				return (
					useCases?.updateTag.execute(workspaceId, id, tagData) ??
					Promise.resolve(null)
				);
			},
			(result) => {
				if (result) {
					updatedTag = result as Tag;
					const index = tags.value.findIndex((tag) => tag.id === id);
					if (index !== -1 && updatedTag) {
						// More efficient array update using direct assignment
						const newTags = [...tags.value];
						newTags[index] = updatedTag;
						tags.value = newTags;
					}
				}
			},
			"UPDATE_TAG_ERROR",
			"Failed to update tag",
		);

		if (!updatedTag) {
			throw new Error("Failed to update tag: No result returned from use case");
		}

		return updatedTag;
	};

	const deleteTag = async (id: string): Promise<void> => {
		await withAsyncAction(
			"delete",
			() => useCases?.deleteTag.execute(id) ?? Promise.resolve(),
			() => {
				tags.value = tags.value.filter((tag) => tag.id !== id);
			},
			"DELETE_TAG_ERROR",
			"Failed to delete tag",
		);
	};

	// Convenience methods
	const findTagById = (id: string): Tag | undefined => {
		if (!id || id.trim() === "") {
			return undefined;
		}
		return tags.value.find((tag) => tag.id === id);
	};

	const findTagsByColor = (color: string): Tag[] => {
		if (!color || color.trim() === "") {
			return [];
		}
		return tags.value.filter((tag) => tag.color === color);
	};

	const getTagsBySubscriberCount = (ascending = false): Tag[] => {
		// Create a stable sort to avoid unnecessary re-renders
		return tags.value
			.slice() // Create shallow copy
			.sort((a, b) => {
				const countA = a.subscriberCount;
				const countB = b.subscriberCount;
				const result = ascending ? countA - countB : countB - countA;
				// Add secondary sort by id for stability
				return result !== 0 ? result : a.id.localeCompare(b.id);
			});
	};

	const refreshTags = async (): Promise<void> => {
		await fetchTags();
	};

	// Batch operations for better performance
	const createMultipleTags = async (
		tagDataList: CreateTagData[],
	): Promise<Tag[]> => {
		const createdTags: Tag[] = [];

		for (const tagData of tagDataList) {
			try {
				const tag = await createTag(tagData);
				createdTags.push(tag);
			} catch (err) {
				// Log error but continue with other tags
				console.warn(`Failed to create tag ${tagData.name}:`, err);
			}
		}

		return createdTags;
	};

	return {
		// State
		tags: readonly(tags),
		loading: readonly(loading),
		error: readonly(error),

		// Computed
		isLoading,
		hasError,
		tagCount,
		isDataLoaded,

		// Actions
		initializeStore,
		resetState,
		clearError: errorUtils.clear,
		fetchTags,
		createTag,
		updateTag,
		deleteTag,
		refreshTags,

		// Convenience methods
		findTagById,
		findTagsByColor,
		getTagsBySubscriberCount,
		createMultipleTags,
	};
});

/**
 * Type for the tag store instance
 */
export type TagStore = ReturnType<typeof useTagStore>;
