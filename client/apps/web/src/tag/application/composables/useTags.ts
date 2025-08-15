/**
 * Composable for using the tags service with reactive state
 * Provides convenient access to tag functionality through clean architecture
 */

import { type ComputedRef, computed } from "vue";
import type { Tag } from "../../domain/models";
import type { CreateTagData, UpdateTagData } from "../../domain/usecases";
import { getTagService } from "../services/TagService";

/**
 * Return type for the useTags composable
 */
export interface UseTagsReturn {
	// State
	readonly tags: ComputedRef<Tag[]>;
	readonly isLoading: ComputedRef<boolean>;
	readonly hasError: ComputedRef<boolean>;
	readonly error: ComputedRef<Error | null>;
	readonly tagCount: ComputedRef<number>;
	readonly isDataLoaded: ComputedRef<boolean>;

	// Actions
	readonly fetchTags: () => Promise<void>;
	readonly createTag: (tagData: CreateTagData) => Promise<Tag | null>;
	readonly updateTag: (
		id: string,
		tagData: UpdateTagData,
	) => Promise<Tag | null>;
	readonly deleteTag: (id: string) => Promise<void>;
	readonly refreshTags: () => Promise<void>;
	readonly clearError: () => void;
	readonly resetState: () => void;

	// Convenience methods
	readonly findTagById: (id: string) => Tag | undefined;
	readonly findTagsByColor: (color: string) => Tag[];
	readonly getTagsBySubscriberCount: (ascending?: boolean) => Tag[];
}

/**
 * Composable that provides access to the tags service
 * Uses reactive state to track service changes
 * @returns Tag service methods and reactive state
 */
export function useTags(): UseTagsReturn {
	// Get the service instance
	const service = getTagService();

	// Create computed refs directly from service for better performance
	const tagsComputed = computed(() => service.getTags());
	const isLoadingComputed = computed(() => service.isLoading());
	const hasErrorComputed = computed(() => service.hasError());
	const errorComputed = computed(() => service.getError());
	const tagCountComputed = computed(() => service.getTagCount());
	const isDataLoadedComputed = computed(() => service.isDataLoaded());

	/**
	 * Fetch all tags from the API
	 */
	const fetchTags = async (): Promise<void> => {
		await service.fetchTags();
	};

	/**
	 * Create a new tag
	 * @param tagData - The tag data to create
	 * @returns The created tag or null if validation fails
	 */
	const createTag = async (tagData: CreateTagData): Promise<Tag | null> => {
		try {
			return await service.createTag(tagData);
		} catch (_error) {
			// Error is already handled by the store (error state is set)
			return null;
		}
	};

	/**
	 * Update an existing tag
	 * @param id - The tag ID to update
	 * @param tagData - The updated tag data
	 * @returns The updated tag or null if validation fails
	 */
	const updateTag = async (
		id: string,
		tagData: UpdateTagData,
	): Promise<Tag | null> => {
		try {
			return await service.updateTag(id, tagData);
		} catch (_error) {
			// Error is already handled by the store (error state is set)
			return null;
		}
	};

	/**
	 * Delete a tag by ID
	 * @param id - The tag ID to delete
	 */
	const deleteTag = async (id: string): Promise<void> => {
		await service.deleteTag(id);
	};

	/**
	 * Refresh the tags data by fetching from the API
	 */
	const refreshTags = async (): Promise<void> => {
		await service.refreshTags();
	};

	/**
	 * Clear any error state
	 */
	const clearError = (): void => {
		service.clearError();
	};

	/**
	 * Reset the store to its initial state
	 */
	const resetState = (): void => {
		service.resetState();
	};

	/**
	 * Find a tag by its ID
	 * @param id - The tag ID to search for
	 * @returns The tag if found, undefined otherwise
	 */
	const findTagById = (id: string): Tag | undefined => {
		return service.findTagById(id);
	};

	/**
	 * Find all tags with a specific color
	 * @param color - The color to filter by
	 * @returns Array of tags with the specified color
	 */
	const findTagsByColor = (color: string): Tag[] => {
		return service.findTagsByColor(color);
	};

	/**
	 * Get tags sorted by subscriber count
	 * @param ascending - Whether to sort in ascending order (default: false)
	 * @returns Array of tags sorted by subscriber count
	 */
	const getTagsBySubscriberCount = (ascending = false): Tag[] => {
		return service.getTagsBySubscriberCount(ascending);
	};

	return {
		// State
		tags: tagsComputed,
		isLoading: isLoadingComputed,
		hasError: hasErrorComputed,
		error: errorComputed,
		tagCount: tagCountComputed,
		isDataLoaded: isDataLoadedComputed,

		// Actions
		fetchTags,
		createTag,
		updateTag,
		deleteTag,
		refreshTags,
		clearError,
		resetState,

		// Convenience methods
		findTagById,
		findTagsByColor,
		getTagsBySubscriberCount,
	};
}
