/**
 * Composable for workspace display logic
 * Handles text formatting, icons, and visual states with optimized reactivity
 */

import { computed, type Ref, unref } from "vue";
import type { Workspace } from "@/workspace/domain/models";

interface UseWorkspaceDisplayOptions {
	activeWorkspace: Ref<Workspace | null>;
	loading: Ref<boolean>;
	hasWorkspaces: Ref<boolean>;
	isSearching?: Ref<boolean>;
	searchQuery?: Ref<string>;
}

export function useWorkspaceDisplay({
	activeWorkspace,
	loading,
	hasWorkspaces,
	isSearching,
	searchQuery,
}: UseWorkspaceDisplayOptions) {
	// Optimized display text with memoization
	const displayText = computed(() => {
		const isLoading = unref(loading);
		const workspace = unref(activeWorkspace);
		const searching = unref(isSearching);

		if (isLoading) return "Loading...";
		if (searching) return "Searching...";
		if (!workspace) return "No workspace selected";
		return workspace.name;
	});

	// Optimized display subtext with memoization
	const displaySubtext = computed(() => {
		const isLoading = unref(loading);
		const workspace = unref(activeWorkspace);
		const searching = unref(isSearching);
		const query = unref(searchQuery);

		if (isLoading) return "Please wait";
		if (searching && query) return `Searching for "${query}"`;
		if (!workspace) return "Select a workspace";
		return workspace.description || "Workspace";
	});

	// Optimized empty state detection
	const showEmptyState = computed(() => {
		const isLoading = unref(loading);
		const hasWs = unref(hasWorkspaces);
		const searching = unref(isSearching);

		return !isLoading && !searching && !hasWs;
	});

	// Optimized loading state detection
	const showLoadingState = computed(() => {
		const isLoading = unref(loading);
		const searching = unref(isSearching);

		return isLoading || searching;
	});

	// Memoized workspace comparison function
	const isWorkspaceActive = (workspace: Workspace): boolean => {
		const activeId = unref(activeWorkspace)?.id;
		return workspace.id === activeId;
	};

	// Display state helpers
	const displayState = computed(() => {
		const isLoading = unref(loading);
		const workspace = unref(activeWorkspace);
		const hasWs = unref(hasWorkspaces);
		const searching = unref(isSearching);

		if (isLoading) return "loading";
		if (searching) return "searching";
		if (!hasWs) return "empty";
		if (!workspace) return "no-selection";
		return "active";
	});

	// Icon state for better performance
	const iconState = computed(() => {
		const state = displayState.value;

		switch (state) {
			case "loading":
			case "searching":
				return "loading";
			case "empty":
				return "empty";
			case "no-selection":
				return "inactive";
			case "active":
			default:
				return "active";
		}
	});

	return {
		// Display text
		displayText,
		displaySubtext,

		// State flags
		showEmptyState,
		showLoadingState,
		displayState,
		iconState,

		// Functions
		isWorkspaceActive,
	};
}
