/**
 * Test utilities and helpers for sidebar components
 * Provides reusable mock data and helper functions for testing
 */
import { vi } from "vitest";
import type { AppSidebarItem } from "./types";

/**
 * Creates a mock sidebar item with default values and optional overrides
 */
export const createMockItem = (
	overrides: Partial<AppSidebarItem> = {},
): AppSidebarItem => ({
	title: "Test Item",
	...overrides,
});

/**
 * Creates a nested structure of mock items for testing hierarchical navigation
 */
export const createNestedMockItems = (): AppSidebarItem[] => [
	{
		title: "Parent 1",
		items: [
			{ title: "Child 1.1", url: "/child1" },
			{ title: "Child 1.2", url: "/child2" },
		],
	},
	{
		title: "Parent 2",
		url: "/parent2",
		items: [{ title: "Child 2.1", url: "/child3" }],
	},
];

/**
 * Creates mock items with various visibility and access control scenarios
 */
export const createAccessControlMockItems = (): AppSidebarItem[] => [
	{ title: "Always Visible", visible: true },
	{ title: "Always Hidden", visible: false },
	{ title: "Conditionally Visible", visible: () => true },
	{ title: "Conditionally Hidden", visible: () => false },
	{ title: "Always Accessible", canAccess: () => true },
	{ title: "Never Accessible", canAccess: () => false },
	{ title: "Async Accessible", canAccess: async () => true },
	{ title: "Async Inaccessible", canAccess: async () => false },
];

/**
 * Creates deeply nested mock items for testing recursive operations
 */
export const createDeeplyNestedMockItems = (): AppSidebarItem[] => [
	{
		title: "Level 1",
		items: [
			{
				title: "Level 2",
				items: [
					{
						title: "Level 3",
						items: [{ title: "Level 4", url: "/deep/nested" }],
					},
				],
			},
		],
	},
];

/**
 * Creates mock items with invalid data for error testing
 */
export const createInvalidMockItems = (): unknown[] => [
	{ title: "Valid Item" },
	null,
	undefined,
	{ title: "" }, // Empty title
	{ notTitle: "Invalid" }, // Missing title
	{ title: 123 }, // Non-string title
];

/**
 * Mock console methods for testing logging behavior
 */
export const mockConsole = () => {
	const originalConsole = { ...console };
	const mocks = {
		log: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	};

	Object.assign(console, mocks);

	return {
		mocks,
		restore: () => Object.assign(console, originalConsole),
	};
};

/**
 * Creates a performance timing mock for testing performance monitoring
 */
export const mockPerformance = () => {
	const originalNow = performance.now;
	let callCount = 0;

	const mockNow = vi.fn().mockImplementation(() => {
		callCount++;
		// First call returns 0, subsequent calls return increasing values
		return (callCount - 1) * 10; // 10ms increments
	});

	performance.now = mockNow;

	return {
		mockNow,
		restore: () => {
			performance.now = originalNow;
		},
	};
};
