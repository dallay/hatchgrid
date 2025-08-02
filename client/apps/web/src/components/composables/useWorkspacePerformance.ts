/**
 * Composable for workspace performance optimizations
 * Provides memoization, virtual scrolling helpers, and reactive optimizations
 */

import { computed, type Ref, ref, shallowRef, unref, watchEffect } from "vue";
import type { Workspace } from "@/workspace/domain/models";

interface UseWorkspacePerformanceOptions {
	workspaces: Ref<Workspace[]>;
	activeWorkspaceId?: Ref<string | null>;
	enableVirtualScrolling?: boolean;
	virtualScrollThreshold?: number;
}

export function useWorkspacePerformance({
	workspaces,
	activeWorkspaceId,
	enableVirtualScrolling = false,
	virtualScrollThreshold = 100,
}: UseWorkspacePerformanceOptions) {
	// Use shallow refs for better performance with large arrays
	const workspaceMap = shallowRef(new Map<string, Workspace>());
	const workspaceIds = shallowRef<string[]>([]);

	// Update workspace map when workspaces change
	watchEffect(() => {
		const newMap = new Map<string, Workspace>();
		const newIds: string[] = [];

		for (const workspace of unref(workspaces)) {
			newMap.set(workspace.id, workspace);
			newIds.push(workspace.id);
		}

		workspaceMap.value = newMap;
		workspaceIds.value = newIds;
	});

	// Memoized workspace lookup
	const getWorkspaceById = computed(() => {
		return (id: string): Workspace | undefined => {
			return workspaceMap.value.get(id);
		};
	});

	// Memoized active workspace
	const activeWorkspace = computed(() => {
		const id = unref(activeWorkspaceId);
		return id ? workspaceMap.value.get(id) || null : null;
	});

	// Memoized workspace comparison
	const isWorkspaceActive = computed(() => {
		const activeId = unref(activeWorkspaceId);
		return (workspace: Workspace): boolean => {
			return workspace.id === activeId;
		};
	});

	// Virtual scrolling helpers
	const virtualScrollEnabled = computed(
		() =>
			enableVirtualScrolling &&
			workspaces.value.length > virtualScrollThreshold,
	);

	const visibleRange = ref({ start: 0, end: 20 });
	const itemHeight = ref(48); // Default item height in pixels

	const visibleWorkspaces = computed(() => {
		if (!virtualScrollEnabled.value) {
			return workspaces.value;
		}

		const { start, end } = visibleRange.value;
		return workspaces.value.slice(
			start,
			Math.min(end, workspaces.value.length),
		);
	});

	const totalHeight = computed(() => {
		if (!virtualScrollEnabled.value) return "auto";
		return `${workspaces.value.length * itemHeight.value}px`;
	});

	const offsetY = computed(() => {
		if (!virtualScrollEnabled.value) return 0;
		return visibleRange.value.start * itemHeight.value;
	});

	// Update visible range for virtual scrolling
	const updateVisibleRange = (scrollTop: number, containerHeight: number) => {
		if (!virtualScrollEnabled.value) return;

		const itemsPerPage = Math.ceil(containerHeight / itemHeight.value);
		const start = Math.floor(scrollTop / itemHeight.value);
		const end = start + itemsPerPage + 5; // Add buffer

		visibleRange.value = { start, end };
	};

	// Performance metrics
	const performanceStats = computed(() => ({
		totalWorkspaces: workspaces.value.length,
		visibleWorkspaces: visibleWorkspaces.value.length,
		virtualScrollEnabled: virtualScrollEnabled.value,
		mapSize: workspaceMap.value.size,
	}));

	// Batch operations for better performance
	const batchUpdateWorkspaces = (newWorkspaces: Workspace[]) => {
		// Use a single update to minimize reactivity triggers
		workspaces.value = newWorkspaces;
	};

	// Memory cleanup
	const cleanup = () => {
		workspaceMap.value.clear();
		workspaceIds.value = [];
		visibleRange.value = { start: 0, end: 20 };
	};

	return {
		// Optimized data access
		workspaceMap: computed(() => workspaceMap.value),
		workspaceIds: computed(() => workspaceIds.value),
		getWorkspaceById,
		activeWorkspace,
		isWorkspaceActive,

		// Virtual scrolling
		virtualScrollEnabled,
		visibleWorkspaces,
		totalHeight,
		offsetY,
		updateVisibleRange,
		itemHeight,

		// Performance utilities
		performanceStats,
		batchUpdateWorkspaces,
		cleanup,
	};
}
