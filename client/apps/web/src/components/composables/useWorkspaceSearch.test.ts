/**
 * Tests for useWorkspaceSearch composable
 */

import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";
import { useWorkspaceSearch } from "./useWorkspaceSearch";

// Mock the debounce utility
vi.mock("@hatchgrid/utilities", () => ({
	debounce: vi.fn((fn, delay) => {
		// For testing, return the function immediately without debouncing
		return fn;
	}),
}));

describe("useWorkspaceSearch", () => {
	const mockWorkspaces: Workspace[] = [
		{
			id: "1",
			name: "Development Workspace",
			description: "For development work",
			ownerId: "owner1",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
		},
		{
			id: "2",
			name: "Production Environment",
			description: "Live production system",
			ownerId: "owner2",
			createdAt: "2023-01-02T00:00:00Z",
			updatedAt: "2023-01-02T00:00:00Z",
		},
		{
			id: "3",
			name: "Testing Lab",
			description: "Quality assurance testing",
			ownerId: "owner3",
			createdAt: "2023-01-03T00:00:00Z",
			updatedAt: "2023-01-03T00:00:00Z",
		},
	];

	it("should initialize with empty search", () => {
		const workspaces = ref(mockWorkspaces);
		const {
			searchQuery,
			debouncedSearchQuery,
			isSearching,
			filteredWorkspaces,
			hasSearchQuery,
			hasResults,
		} = useWorkspaceSearch({ workspaces });

		expect(searchQuery.value).toBe("");
		expect(debouncedSearchQuery.value).toBe("");
		expect(isSearching.value).toBe(false);
		expect(filteredWorkspaces.value).toEqual(mockWorkspaces);
		expect(hasSearchQuery.value).toBe(false);
		expect(hasResults.value).toBe(true);
	});

	it("should filter workspaces by name", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, filteredWorkspaces } = useWorkspaceSearch({
			workspaces,
		});

		setSearchQuery("development");

		expect(filteredWorkspaces.value).toHaveLength(1);
		expect(filteredWorkspaces.value[0].name).toBe("Development Workspace");
	});

	it("should filter workspaces by description", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, filteredWorkspaces } = useWorkspaceSearch({
			workspaces,
		});

		setSearchQuery("testing");

		expect(filteredWorkspaces.value).toHaveLength(1);
		expect(filteredWorkspaces.value[0].name).toBe("Testing Lab");
	});

	it("should be case insensitive", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, filteredWorkspaces } = useWorkspaceSearch({
			workspaces,
		});

		setSearchQuery("PRODUCTION");

		expect(filteredWorkspaces.value).toHaveLength(1);
		expect(filteredWorkspaces.value[0].name).toBe("Production Environment");
	});

	it("should return all workspaces for short queries", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, filteredWorkspaces } = useWorkspaceSearch({
			workspaces,
			minSearchLength: 3,
		});

		setSearchQuery("de"); // Less than minSearchLength

		expect(filteredWorkspaces.value).toEqual(mockWorkspaces);
	});

	it("should clear search correctly", () => {
		const workspaces = ref(mockWorkspaces);
		const {
			setSearchQuery,
			clearSearch,
			searchQuery,
			debouncedSearchQuery,
			filteredWorkspaces,
		} = useWorkspaceSearch({ workspaces });

		setSearchQuery("development");
		clearSearch();

		expect(searchQuery.value).toBe("");
		expect(debouncedSearchQuery.value).toBe("");
		expect(filteredWorkspaces.value).toEqual(mockWorkspaces);
	});

	it("should show no results state correctly", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, showNoResults } = useWorkspaceSearch({
			workspaces,
		});

		setSearchQuery("nonexistent");

		expect(showNoResults.value).toBe(true);
	});

	it("should provide search statistics", () => {
		const workspaces = ref(mockWorkspaces);
		const { setSearchQuery, searchStats } = useWorkspaceSearch({
			workspaces,
		});

		setSearchQuery("development");

		expect(searchStats.value.totalWorkspaces).toBe(3);
		expect(searchStats.value.filteredCount).toBe(1);
		expect(searchStats.value.isFiltered).toBe(true);
		expect(searchStats.value.query).toBe("development");
	});
});
