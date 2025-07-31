/**
 * Composable for workspace search functionality with debouncing
 * Provides search filtering and optimization for large workspace lists
 */

import { debounce } from "@hatchgrid/utilities";
import { computed, type Ref, ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";

interface UseWorkspaceSearchOptions {
	workspaces: Ref<Workspace[]>;
	searchDelay?: number;
	minSearchLength?: number;
}

export function useWorkspaceSearch({
	workspaces,
	searchDelay = 300,
	minSearchLength = 2,
}: UseWorkspaceSearchOptions) {
	const searchQuery = ref("");
	const debouncedSearchQuery = ref("");
	const isSearching = ref(false);

	// Debounced search function
	const updateDebouncedSearch = debounce((query: string) => {
		debouncedSearchQuery.value = query;
		isSearching.value = false;
	}, searchDelay);

	// Update search query and trigger debounced update
	const setSearchQuery = (query: string) => {
		searchQuery.value = query;
		isSearching.value = query.length >= minSearchLength;
		updateDebouncedSearch(query);
	};

	// Clear search
	const clearSearch = () => {
		searchQuery.value = "";
		debouncedSearchQuery.value = "";
		isSearching.value = false;
	};

	// Computed filtered workspaces
	const filteredWorkspaces = computed(() => {
		const query = debouncedSearchQuery.value.toLowerCase().trim();

		// Return all workspaces if search query is too short
		if (query.length < minSearchLength) {
			return workspaces.value;
		}

		// Filter workspaces by name and description
		return workspaces.value.filter((workspace) => {
			const nameMatch = workspace.name.toLowerCase().includes(query);
			const descriptionMatch =
				workspace.description?.toLowerCase().includes(query) || false;
			return nameMatch || descriptionMatch;
		});
	});

	// Search state computed properties
	const hasSearchQuery = computed(() => searchQuery.value.length > 0);
	const hasResults = computed(() => filteredWorkspaces.value.length > 0);
	const showNoResults = computed(
		() =>
			hasSearchQuery.value &&
			!isSearching.value &&
			!hasResults.value &&
			debouncedSearchQuery.value.length >= minSearchLength,
	);

	// Search statistics
	const searchStats = computed(() => ({
		totalWorkspaces: workspaces.value.length,
		filteredCount: filteredWorkspaces.value.length,
		isFiltered: debouncedSearchQuery.value.length >= minSearchLength,
		query: debouncedSearchQuery.value,
	}));

	return {
		// State
		searchQuery: computed(() => searchQuery.value),
		debouncedSearchQuery: computed(() => debouncedSearchQuery.value),
		isSearching: computed(() => isSearching.value),

		// Results
		filteredWorkspaces,
		hasSearchQuery,
		hasResults,
		showNoResults,
		searchStats,

		// Actions
		setSearchQuery,
		clearSearch,
	};
}
