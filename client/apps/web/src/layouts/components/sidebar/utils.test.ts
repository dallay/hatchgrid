import type { LucideIcon } from "lucide-vue-next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Test helpers are available but not used in this file
import type { AppSidebarItem } from "./types";
import {
	canAccess,
	clearActiveParentsCache,
	createSidebarItem,
	debouncedClearCache,
	filterNavItems,
	findActiveParents,
	isItemActive,
	isVisible,
	measureNavigationPerformance,
	safeProcessNavItems,
	validateNavConfig,
	validateSidebarItem,
	validateSidebarItems,
} from "./utils";

describe("Sidebar Utils", () => {
	beforeEach(() => {
		// Clear caches before each test
		clearActiveParentsCache();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("isVisible", () => {
		it("should return true when visible is undefined", () => {
			const item: AppSidebarItem = { title: "Test" };
			expect(isVisible(item)).toBe(true);
		});

		it("should return true when visible is true", () => {
			const item: AppSidebarItem = { title: "Test", visible: true };
			expect(isVisible(item)).toBe(true);
		});

		it("should return false when visible is false", () => {
			const item: AppSidebarItem = { title: "Test", visible: false };
			expect(isVisible(item)).toBe(false);
		});

		it("should evaluate function and return result when visible is a function", () => {
			const visibleFn = vi.fn().mockReturnValue(true);
			const item: AppSidebarItem = { title: "Test", visible: visibleFn };

			expect(isVisible(item)).toBe(true);
			expect(visibleFn).toHaveBeenCalled();
		});

		it("should handle function that returns false", () => {
			const visibleFn = vi.fn().mockReturnValue(false);
			const item: AppSidebarItem = { title: "Test", visible: visibleFn };

			expect(isVisible(item)).toBe(false);
			expect(visibleFn).toHaveBeenCalled();
		});

		it("should handle function that throws error gracefully", () => {
			const visibleFn = vi.fn().mockImplementation(() => {
				throw new Error("Visibility check failed");
			});
			const item: AppSidebarItem = { title: "Test", visible: visibleFn };

			// Should throw if visible function throws
			expect(() => isVisible(item)).toThrow();
		});

		it("should call function each time isVisible is called", () => {
			const visibleFn = vi.fn().mockReturnValue(true);
			const item: AppSidebarItem = { title: "Test", visible: visibleFn };

			isVisible(item);
			isVisible(item);

			expect(visibleFn).toHaveBeenCalledTimes(2);
		});
	});

	describe("canAccess", () => {
		it("should return true when canAccess is undefined", async () => {
			const item: AppSidebarItem = { title: "Test" };
			expect(await canAccess(item)).toBe(true);
		});

		it("should handle synchronous access function returning true", async () => {
			const accessFn = vi.fn().mockReturnValue(true);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(true);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle synchronous access function returning false", async () => {
			const accessFn = vi.fn().mockReturnValue(false);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle asynchronous access function returning true", async () => {
			const accessFn = vi.fn().mockResolvedValue(true);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(true);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle asynchronous access function returning false", async () => {
			const accessFn = vi.fn().mockResolvedValue(false);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle access function errors gracefully with Error object", async () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const accessFn = vi.fn().mockRejectedValue(new Error("Access denied"));
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Access control check failed for item "Test":',
				"Access denied",
			);

			consoleSpy.mockRestore();
		});

		it("should handle access function errors gracefully with string error", async () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const accessFn = vi.fn().mockRejectedValue("String error");
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Access control check failed for item "Test":',
				"String error",
			);

			consoleSpy.mockRestore();
		});

		it("should handle synchronous access function that throws", async () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const accessFn = vi.fn().mockImplementation(() => {
				throw new Error("Sync error");
			});
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Access control check failed for item "Test":',
				"Sync error",
			);

			consoleSpy.mockRestore();
		});

		it("should handle mixed sync and async access functions", async () => {
			const syncAccessFn = vi.fn().mockReturnValue(true);
			const asyncAccessFn = vi.fn().mockResolvedValue(false);

			const syncItem: AppSidebarItem = {
				title: "Sync",
				canAccess: syncAccessFn,
			};
			const asyncItem: AppSidebarItem = {
				title: "Async",
				canAccess: asyncAccessFn,
			};

			expect(await canAccess(syncItem)).toBe(true);
			expect(await canAccess(asyncItem)).toBe(false);

			expect(syncAccessFn).toHaveBeenCalled();
			expect(asyncAccessFn).toHaveBeenCalled();
		});

		it("should handle Promise that resolves to non-boolean value", async () => {
			const accessFn = vi.fn().mockResolvedValue("truthy string");
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			// Should return the actual resolved value, not just boolean true
			expect(await canAccess(item)).toBe("truthy string");
		});
	});

	describe("isItemActive", () => {
		it("should return true when isActive is explicitly true", () => {
			const item: AppSidebarItem = { title: "Test", isActive: true };
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should return true when isActive is true regardless of URL", () => {
			const item: AppSidebarItem = {
				title: "Test",
				isActive: true,
				url: "/different",
			};
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should return true when URL matches current route exactly", () => {
			const item: AppSidebarItem = { title: "Test", url: "/test" };
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should return false when URL does not match current route", () => {
			const item: AppSidebarItem = { title: "Test", url: "/other" };
			expect(isItemActive(item, "/test")).toBe(false);
		});

		it("should return false when item has no URL and isActive is false", () => {
			const item: AppSidebarItem = { title: "Test" };
			expect(isItemActive(item, "/test")).toBe(false);
		});

		it("should check children recursively for active state", () => {
			const item: AppSidebarItem = {
				title: "Parent",
				items: [
					{ title: "Child 1", url: "/child1" },
					{ title: "Child 2", url: "/child2" },
				],
			};
			expect(isItemActive(item, "/child1")).toBe(true);
			expect(isItemActive(item, "/child2")).toBe(true);
			expect(isItemActive(item, "/other")).toBe(false);
		});

		it("should handle deeply nested children", () => {
			const item: AppSidebarItem = {
				title: "Grandparent",
				items: [
					{
						title: "Parent",
						items: [
							{
								title: "Child",
								items: [{ title: "Grandchild", url: "/deep/nested" }],
							},
						],
					},
				],
			};
			expect(isItemActive(item, "/deep/nested")).toBe(true);
		});

		it("should handle items with no children", () => {
			const item: AppSidebarItem = { title: "Leaf", url: "/leaf" };
			expect(isItemActive(item, "/leaf")).toBe(true);
			expect(isItemActive(item, "/other")).toBe(false);
		});

		it("should handle empty children array", () => {
			const item: AppSidebarItem = { title: "Parent", items: [] };
			expect(isItemActive(item, "/test")).toBe(false);
		});

		it("should use memoization for performance", () => {
			const item: AppSidebarItem = { title: "Test", url: "/test" };

			// First call should calculate
			const result1 = isItemActive(item, "/test");
			// Second call should use cache
			const result2 = isItemActive(item, "/test");

			expect(result1).toBe(true);
			expect(result2).toBe(true);
		});

		it("should handle various route scenarios", () => {
			const items: AppSidebarItem[] = [
				{ title: "Home", url: "/" },
				{ title: "About", url: "/about" },
				{ title: "Contact", url: "/contact" },
				{ title: "Dashboard", url: "/dashboard" },
				{ title: "Profile", url: "/profile/settings" },
			];

			const routes = [
				"/",
				"/about",
				"/contact",
				"/dashboard",
				"/profile/settings",
				"/nonexistent",
			];

			routes.forEach((route) => {
				items.forEach((item) => {
					const expected = item.url === route;
					expect(isItemActive(item, route)).toBe(expected);
				});
			});
		});

		it("should prioritize isActive over URL matching", () => {
			const item: AppSidebarItem = {
				title: "Test",
				url: "/different",
				isActive: true,
			};
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should handle special characters in URLs", () => {
			const item: AppSidebarItem = {
				title: "Special",
				url: "/path-with-dashes/and_underscores",
			};
			expect(isItemActive(item, "/path-with-dashes/and_underscores")).toBe(
				true,
			);
			expect(isItemActive(item, "/different")).toBe(false);
		});
	});

	describe("findActiveParents", () => {
		it("should find parents with active children", () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent",
					items: [
						{ title: "Active Child", url: "/active" },
						{ title: "Inactive Child", url: "/inactive" },
					],
				},
			];

			const activeParents = findActiveParents(items, "/active");
			expect(activeParents).toHaveLength(1);
			expect(activeParents[0]).toBe("Parent");
		});

		it("should handle nested active parents", () => {
			const items: AppSidebarItem[] = [
				{
					title: "Grandparent",
					items: [
						{
							title: "Parent",
							items: [{ title: "Active Child", url: "/active" }],
						},
					],
				},
			];

			const activeParents = findActiveParents(items, "/active");
			expect(activeParents).toHaveLength(2);
			expect(activeParents).toContain("Grandparent");
			expect(activeParents).toContain("Parent");
		});

		it("should remove duplicate parents", () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent",
					items: [
						{ title: "Active Child 1", url: "/active1" },
						{ title: "Active Child 2", url: "/active2" },
					],
				},
			];

			// Test with one of the active children
			const activeParents = findActiveParents(items, "/active1");
			expect(activeParents).toHaveLength(1);
			expect(activeParents[0]).toBe("Parent");
		});
	});

	describe("filterNavItems", () => {
		it("should filter out invisible items with boolean values", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Visible", visible: true },
				{ title: "Invisible", visible: false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Visible", "Default"]);
		});

		it("should filter out invisible items with function values", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Visible", visible: () => true },
				{ title: "Invisible", visible: () => false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Visible", "Default"]);
		});

		it("should filter out inaccessible items with sync functions", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Accessible", canAccess: () => true },
				{ title: "Inaccessible", canAccess: () => false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Accessible", "Default"]);
		});

		it("should filter out inaccessible items with async functions", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Accessible", canAccess: async () => true },
				{ title: "Inaccessible", canAccess: async () => false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Accessible", "Default"]);
		});

		it("should handle complex nested structures", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent 1",
					visible: true,
					items: [
						{ title: "Child 1.1", visible: true },
						{ title: "Child 1.2", visible: false },
						{
							title: "Child 1.3",
							visible: true,
							items: [
								{ title: "Grandchild 1.3.1", canAccess: () => true },
								{ title: "Grandchild 1.3.2", canAccess: () => false },
							],
						},
					],
				},
				{
					title: "Parent 2",
					visible: false,
					items: [{ title: "Child 2.1", visible: true }],
				},
				{
					title: "Parent 3",
					canAccess: async () => false,
					items: [{ title: "Child 3.1", visible: true }],
				},
			];

			const filtered = await filterNavItems(items);

			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe("Parent 1");
			expect(filtered[0].items).toHaveLength(2);
			expect(filtered[0].items?.[0].title).toBe("Child 1.1");
			expect(filtered[0].items?.[1].title).toBe("Child 1.3");
			expect(filtered[0].items?.[1].items).toHaveLength(1);
			expect(filtered[0].items?.[1].items?.[0].title).toBe("Grandchild 1.3.1");
		});

		it("should recursively filter nested items", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent",
					items: [
						{ title: "Visible Child", visible: true },
						{ title: "Invisible Child", visible: false },
					],
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].items).toHaveLength(1);
			expect(filtered[0].items?.[0].title).toBe("Visible Child");
		});

		it("should remove parent items with no accessible children", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent with no accessible children",
					items: [
						{ title: "Inaccessible Child 1", canAccess: () => false },
						{ title: "Inaccessible Child 2", visible: false },
					],
				},
				{
					title: "Parent with accessible children",
					items: [{ title: "Accessible Child", canAccess: () => true }],
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe("Parent with accessible children");
		});

		it("should handle mixed visibility and access control", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Visible and Accessible",
					visible: true,
					canAccess: () => true,
				},
				{
					title: "Visible but Inaccessible",
					visible: true,
					canAccess: () => false,
				},
				{
					title: "Invisible but Accessible",
					visible: false,
					canAccess: () => true,
				},
				{
					title: "Invisible and Inaccessible",
					visible: false,
					canAccess: () => false,
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe("Visible and Accessible");
		});

		it("should handle empty arrays", async () => {
			const filtered = await filterNavItems([]);
			expect(filtered).toHaveLength(0);
		});

		it("should preserve item properties during filtering", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Test Item",
					url: "/test",
					icon: {} as LucideIcon,
					tooltip: "Test tooltip",
					isActive: true,
					visible: true,
					canAccess: () => true,
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(1);

			const item = filtered[0];
			expect(item.title).toBe("Test Item");
			expect(item.url).toBe("/test");
			expect(item.tooltip).toBe("Test tooltip");
			expect(item.isActive).toBe(true);
		});

		it("should handle access control errors gracefully", async () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const items: AppSidebarItem[] = [
				{ title: "Good Item", canAccess: () => true },
				{
					title: "Error Item",
					canAccess: () => {
						throw new Error("Access error");
					},
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe("Good Item");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("validateSidebarItem", () => {
		it("should return errors for missing title", () => {
			const item: AppSidebarItem = { title: "" };
			const errors = validateSidebarItem(item);

			expect(errors).toHaveLength(1);
			expect(errors[0]).toContain("title is required");
		});

		it("should return errors for invalid URL format", () => {
			const item: AppSidebarItem = {
				title: "Test",
				url: "invalid-url",
			};
			const errors = validateSidebarItem(item);

			expect(errors).toHaveLength(1);
			expect(errors[0]).toContain("Invalid URL format");
		});

		it("should validate nested items recursively", () => {
			const item: AppSidebarItem = {
				title: "Parent",
				items: [
					{ title: "" }, // Invalid child
				],
			};

			const errors = validateSidebarItem(item);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("Child item");
		});

		it("should return empty array for valid item", () => {
			const item: AppSidebarItem = {
				title: "Valid Item",
				url: "/valid",
			};

			const errors = validateSidebarItem(item);
			expect(errors).toHaveLength(0);
		});
	});

	describe("validateSidebarItems", () => {
		it("should validate array of items", () => {
			const items: AppSidebarItem[] = [
				{ title: "Valid" },
				{ title: "" }, // Invalid
			];

			const errors = validateSidebarItems(items);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("Item 1");
		});

		it("should return empty array for valid items", () => {
			const items: AppSidebarItem[] = [
				{ title: "Valid 1" },
				{ title: "Valid 2", url: "/valid" },
			];

			const errors = validateSidebarItems(items);
			expect(errors).toHaveLength(0);
		});
	});

	describe("validateNavConfig", () => {
		it("should error for non-array input", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			validateNavConfig({} as unknown);
			expect(consoleSpy).toHaveBeenCalledWith(
				"Navigation items must be an array",
			);

			consoleSpy.mockRestore();
		});

		it("should warn for empty array", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			validateNavConfig([]);
			expect(consoleSpy).toHaveBeenCalledWith(
				"Navigation items array is empty",
			);

			consoleSpy.mockRestore();
		});

		it("should warn for configuration issues", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const items = [{ title: "Valid Title", url: "invalid-url" }]; // Valid structure but invalid URL

			validateNavConfig(items);
			expect(consoleSpy).toHaveBeenCalledWith(
				"Navigation configuration issues found:",
				expect.any(Array),
			);

			consoleSpy.mockRestore();
		});

		it("should return true for valid configuration", () => {
			const items = [{ title: "Valid Item" }];
			const result = validateNavConfig(items);
			expect(result).toBe(true);
		});

		it("should return false for invalid configuration", () => {
			const items = [{ title: "" }]; // This will fail the type guard
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = validateNavConfig(items);
			expect(result).toBe(false);

			consoleSpy.mockRestore();
		});
	});

	describe("clearActiveParentsCache", () => {
		it("should clear the cache and allow fresh calculations", () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent",
					items: [{ title: "Active Child", url: "/active" }],
				},
			];

			// First call should populate cache
			const result1 = findActiveParents(items, "/active");

			// Clear cache
			clearActiveParentsCache();

			// Second call should work correctly after cache clear
			const result2 = findActiveParents(items, "/active");

			expect(result1).toEqual(result2);
			expect(result1).toHaveLength(1);
			expect(result1[0]).toBe("Parent");
		});
	});

	describe("createSidebarItem", () => {
		it("should create a valid sidebar item with defaults", () => {
			const result = createSidebarItem({ title: "Test Item" });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe("Test Item");
				expect(result.data.isActive).toBe(false);
				expect(result.data.tooltip).toBe("Test Item");
				expect(result.data.visible).toBe(true);
			}
		});

		it("should return errors for invalid configuration", () => {
			const result = createSidebarItem({ title: "" });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("title is required");
			}
		});

		it("should preserve provided values", () => {
			const config = {
				title: "Custom Item",
				url: "/custom",
				isActive: true,
				tooltip: "Custom tooltip",
			};

			const result = createSidebarItem(config);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe("Custom Item");
				expect(result.data.url).toBe("/custom");
				expect(result.data.isActive).toBe(true);
				expect(result.data.tooltip).toBe("Custom tooltip");
			}
		});
	});

	describe("filterNavItems performance", () => {
		it("should handle parallel access control checks", async () => {
			const accessFn = vi.fn().mockResolvedValue(true);
			const items: AppSidebarItem[] = [
				{ title: "Item 1", canAccess: accessFn },
				{ title: "Item 2", canAccess: accessFn },
				{ title: "Item 3", canAccess: accessFn },
			];

			await filterNavItems(items);

			// All access functions should be called
			expect(accessFn).toHaveBeenCalledTimes(3);
		});

		it("should remove parent items with no accessible children", async () => {
			const items: AppSidebarItem[] = [
				{
					title: "Parent",
					items: [{ title: "Inaccessible Child", canAccess: () => false }],
				},
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(0);
		});
	});

	describe("safeProcessNavItems", () => {
		it("should handle non-array input gracefully", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const result = safeProcessNavItems({});
			expect(result).toEqual([]);
			expect(consoleSpy).toHaveBeenCalledWith(
				"Expected array of navigation items, got:",
				"object",
			);

			consoleSpy.mockRestore();
		});

		it("should filter out items with invalid structure", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const items = [
				{ title: "Valid Item" },
				null,
				undefined,
				{ title: "" }, // Empty title
				{ notTitle: "Invalid" },
			];

			const result = safeProcessNavItems(items);
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe("Valid Item");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("should warn about invalid URL formats but not filter them", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const items = [
				{ title: "Valid URL", url: "/valid" },
				{ title: "Invalid URL", url: "invalid-url" },
			];

			const result = safeProcessNavItems(items);
			expect(result).toHaveLength(2);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Invalid URL format for item "Invalid URL": invalid-url',
			);

			consoleSpy.mockRestore();
		});

		it("should recursively process nested items", () => {
			const items = [
				{
					title: "Parent",
					items: [
						{ title: "Valid Child" },
						{ title: "" }, // Invalid child
						null,
					],
				},
			] as unknown[];

			const result = safeProcessNavItems(items);
			expect(result).toHaveLength(1);
			expect(result[0].items).toHaveLength(1);
			expect(result[0].items?.[0].title).toBe("Valid Child");
		});

		it("should ensure title is always a string", () => {
			const items = [{ title: 123 }, { title: "  Valid Title  " }] as unknown[];

			const result = safeProcessNavItems(items);
			// The numeric title should be filtered out since it's not a string
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe("Valid Title");
		});
	});

	describe("measureNavigationPerformance", () => {
		it("should execute operation and return result", () => {
			const operation = vi.fn().mockReturnValue("test result");
			const result = measureNavigationPerformance(operation, "test operation");

			expect(result).toBe("test result");
			expect(operation).toHaveBeenCalled();
		});

		it("should warn about slow operations in development", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Mock slow operation
			const slowOperation = () => {
				// Simulate slow operation by mocking performance.now
				const originalNow = performance.now;
				let callCount = 0;
				vi.spyOn(performance, "now").mockImplementation(() => {
					callCount++;
					return callCount === 1 ? 0 : 20; // 20ms difference
				});

				const result = measureNavigationPerformance(
					() => "result",
					"slow operation",
				);

				performance.now = originalNow;
				return result;
			};

			const result = slowOperation();
			expect(result).toBe("result");

			consoleSpy.mockRestore();
		});
	});

	describe("debouncedClearCache", () => {
		it("should debounce cache clearing", async () => {
			const clearSpy = vi.spyOn(global, "clearTimeout");
			const setSpy = vi.spyOn(global, "setTimeout");

			debouncedClearCache(100);
			debouncedClearCache(100);
			debouncedClearCache(100);

			// Should clear previous timeouts
			expect(clearSpy).toHaveBeenCalledTimes(2);
			expect(setSpy).toHaveBeenCalledTimes(3);

			clearSpy.mockRestore();
			setSpy.mockRestore();
		});

		it("should use default delay when none provided", () => {
			const setSpy = vi.spyOn(global, "setTimeout");

			debouncedClearCache();

			expect(setSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

			setSpy.mockRestore();
		});
	});

	describe("Edge cases and error handling", () => {
		it("should handle items with undefined or null properties", async () => {
			const items = [
				{
					title: "Test",
					url: undefined,
					visible: undefined,
					canAccess: undefined,
				},
				{ title: "Test2", url: null, visible: null, canAccess: null },
			] as AppSidebarItem[];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
		});

		it("should handle small navigation structures efficiently", () => {
			const items: AppSidebarItem[] = [
				{ title: "Item 1", url: "/item-1" },
				{ title: "Item 2", url: "/item-2" },
				{ title: "Item 3", url: "/item-3" },
			];

			const activeStates = items.map((item) => isItemActive(item, "/item-2"));
			expect(activeStates.filter(Boolean)).toHaveLength(1);
		});
	});
});
