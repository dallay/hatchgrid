/**
 * Composable for managing workspace selection logic
 * Centralizes workspace selection, validation, and state management with performance optimizations
 */

import { computed, type Ref, readonly, shallowRef, unref, watch } from "vue";
import type { Workspace } from "@/workspace/domain/models";

interface UseWorkspaceSelectionOptions {
	workspaces: Ref<readonly Workspace[]>;
	initialWorkspaceId?: Ref<string | undefined>;
	onWorkspaceChange?: (workspaceId: string) => void;
}

export function useWorkspaceSelection({
	workspaces,
	initialWorkspaceId,
	onWorkspaceChange,
}: UseWorkspaceSelectionOptions) {
	// Use shallowRef for better performance since we only care about reference changes
	const activeWorkspace = shallowRef<Workspace | null>(null);

	// Memoized workspace map for O(1) lookups
	const workspaceMap = computed(() => {
		const map = new Map<string, Workspace>();
		for (const workspace of unref(workspaces)) {
			map.set(workspace.id, workspace);
		}
		return map;
	});

	// Optimized helper functions
	const findWorkspaceById = computed(() => {
		return (id: string): Workspace | undefined => {
			return workspaceMap.value.get(id);
		};
	});

	const getDefaultWorkspace = computed(() => {
		const workspaceList = unref(workspaces);
		return workspaceList[0] || null;
	});

	// Computed properties with better reactivity
	const hasWorkspaces = computed(() => unref(workspaces).length > 0);

	const selectedWorkspaceId = computed(() => activeWorkspace.value?.id);

	// Core selection logic with validation
	const selectWorkspace = (workspace: Workspace | null) => {
		if (!workspace?.id) {
			console.warn("Invalid workspace selected:", workspace);
			return false;
		}

		// Only update if different (shallow comparison is sufficient)
		if (activeWorkspace.value?.id !== workspace.id) {
			activeWorkspace.value = workspace;
			onWorkspaceChange?.(workspace.id);
			return true;
		}
		return false;
	};

	// Optimized workspace determination
	const determineActiveWorkspace = computed(() => {
		if (!hasWorkspaces.value) return null;

		// Try initial workspace ID first
		const initialId = unref(initialWorkspaceId);
		if (initialId) {
			const workspace = findWorkspaceById.value(initialId);
			if (workspace) return workspace;
		}

		// Fall back to default
		return getDefaultWorkspace.value;
	});

	// Single watcher with optimized dependencies
	watch(
		[workspaces, initialWorkspaceId],
		() => {
			const targetWorkspace = determineActiveWorkspace.value;
			selectWorkspace(targetWorkspace);
		},
		{ immediate: true, flush: "sync" }, // Use sync flush for immediate updates
	);

	// Performance helper to check if workspace exists
	const hasWorkspace = computed(() => {
		return (id: string): boolean => {
			return workspaceMap.value.has(id);
		};
	});

	// Batch selection for multiple workspace operations
	const selectWorkspaceById = (id: string): boolean => {
		const workspace = findWorkspaceById.value(id);
		return selectWorkspace(workspace || null);
	};

	return {
		// State
		activeWorkspace: readonly(activeWorkspace),
		selectedWorkspaceId,
		hasWorkspaces,

		// Optimized lookups
		workspaceMap,
		findWorkspaceById,
		hasWorkspace,

		// Actions
		selectWorkspace,
		selectWorkspaceById,
	};
}
