/**
 * Tests for useWorkspacePerformance composable
 */

import { describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";
import { useWorkspacePerformance } from "./useWorkspacePerformance";

describe("useWorkspacePerformance", () => {
	const mockWorkspaces: Workspace[] = [
		{
			id: "1",
			name: "Workspace 1",
			description: "First workspace",
			ownerId: "owner1",
			isDefault: false,
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
		},
		{
			id: "2",
			name: "Workspace 2",
			description: "Second workspace",
			ownerId: "owner2",
			isDefault: false,
			createdAt: "2023-01-02T00:00:00Z",
			updatedAt: "2023-01-02T00:00:00Z",
		},
		{
			id: "3",
			name: "Workspace 3",
			description: "Third workspace",
			ownerId: "owner3",
			isDefault: false,
			createdAt: "2023-01-03T00:00:00Z",
			updatedAt: "2023-01-03T00:00:00Z",
		},
	];

	it("should create workspace map correctly", () => {
		const workspaces = ref(mockWorkspaces);
		const { workspaceMap, getWorkspaceById } = useWorkspacePerformance({
			workspaces,
		});

		expect(workspaceMap.value.size).toBe(3);
		expect(workspaceMap.value.has("1")).toBe(true);
		expect(getWorkspaceById.value("1")).toEqual(mockWorkspaces[0]);
		expect(getWorkspaceById.value("nonexistent")).toBeUndefined();
	});

	it("should track active workspace correctly", () => {
		const workspaces = ref(mockWorkspaces);
		const activeWorkspaceId = ref("2");
		const { activeWorkspace, isWorkspaceActive } = useWorkspacePerformance({
			workspaces,
			activeWorkspaceId,
		});

		expect(activeWorkspace.value).toEqual(mockWorkspaces[1]);
		expect(isWorkspaceActive.value(mockWorkspaces[1])).toBe(true);
		expect(isWorkspaceActive.value(mockWorkspaces[0])).toBe(false);
	});

	it("should handle virtual scrolling when enabled", () => {
		const largeWorkspaceList = Array.from({ length: 150 }, (_, i) => ({
			id: `${i + 1}`,
			name: `Workspace ${i + 1}`,
			description: `Description ${i + 1}`,
			ownerId: `owner${i + 1}`,
			isDefault: false,
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
		}));

		const workspaces = ref(largeWorkspaceList);
		const {
			virtualScrollEnabled,
			visibleWorkspaces,
			totalHeight,
			updateVisibleRange,
		} = useWorkspacePerformance({
			workspaces,
			enableVirtualScrolling: true,
			virtualScrollThreshold: 100,
		});

		expect(virtualScrollEnabled.value).toBe(true);
		expect(visibleWorkspaces.value.length).toBe(20); // Default visible range
		expect(totalHeight.value).toBe("7200px"); // 150 * 48px

		// Test updating visible range
		updateVisibleRange(480, 960); // Scroll to show items 10-30
		expect(visibleWorkspaces.value.length).toBe(25); // 20 + 5 buffer
	});

	it("should not enable virtual scrolling for small lists", () => {
		const workspaces = ref(mockWorkspaces);
		const { virtualScrollEnabled, visibleWorkspaces } = useWorkspacePerformance(
			{
				workspaces,
				enableVirtualScrolling: true,
				virtualScrollThreshold: 100,
			},
		);

		expect(virtualScrollEnabled.value).toBe(false);
		expect(visibleWorkspaces.value).toEqual(mockWorkspaces);
	});

	it("should provide performance statistics", () => {
		const workspaces = ref(mockWorkspaces);
		const { performanceStats } = useWorkspacePerformance({
			workspaces,
		});

		expect(performanceStats.value.totalWorkspaces).toBe(3);
		expect(performanceStats.value.visibleWorkspaces).toBe(3);
		expect(performanceStats.value.virtualScrollEnabled).toBe(false);
		expect(performanceStats.value.mapSize).toBe(3);
	});

	it("should handle workspace updates efficiently", async () => {
		const workspaces = ref([mockWorkspaces[0]]);
		const { workspaceMap, batchUpdateWorkspaces } = useWorkspacePerformance({
			workspaces,
		});

		expect(workspaceMap.value.size).toBe(1);

		// Batch update - this updates the ref directly
		batchUpdateWorkspaces(mockWorkspaces);

		// Wait for reactive updates
		await nextTick();

		// The workspaceMap should be updated reactively
		expect(workspaces.value.length).toBe(3);
		expect(workspaceMap.value.size).toBe(3);
	});

	it("should cleanup resources correctly", () => {
		const workspaces = ref(mockWorkspaces);
		const { workspaceMap, workspaceIds, cleanup } = useWorkspacePerformance({
			workspaces,
		});

		expect(workspaceMap.value.size).toBe(3);
		expect(workspaceIds.value.length).toBe(3);

		cleanup();
		expect(workspaceMap.value.size).toBe(0);
		expect(workspaceIds.value.length).toBe(0);
	});
});
