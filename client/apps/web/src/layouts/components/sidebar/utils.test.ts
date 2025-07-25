import { describe, expect, it, vi } from "vitest";
import type { AppSidebarItem } from "./types";
import {
	canAccess,
	clearActiveParentsCache,
	createSidebarItem,
	filterNavItems,
	findActiveParents,
	isItemActive,
	isVisible,
	validateNavConfig,
	validateSidebarItem,
	validateSidebarItems,
} from "./utils";

describe("Sidebar Utils", () => {
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

		it("should evaluate function and return result", () => {
			const visibleFn = vi.fn().mockReturnValue(true);
			const item: AppSidebarItem = { title: "Test", visible: visibleFn };

			expect(isVisible(item)).toBe(true);
			expect(visibleFn).toHaveBeenCalled();
		});
	});

	describe("canAccess", () => {
		it("should return true when canAccess is undefined", async () => {
			const item: AppSidebarItem = { title: "Test" };
			expect(await canAccess(item)).toBe(true);
		});

		it("should handle synchronous access function", async () => {
			const accessFn = vi.fn().mockReturnValue(true);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(true);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle asynchronous access function", async () => {
			const accessFn = vi.fn().mockResolvedValue(false);
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(accessFn).toHaveBeenCalled();
		});

		it("should handle access function errors gracefully", async () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const accessFn = vi.fn().mockRejectedValue(new Error("Access denied"));
			const item: AppSidebarItem = { title: "Test", canAccess: accessFn };

			expect(await canAccess(item)).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("isItemActive", () => {
		it("should return true when isActive is true", () => {
			const item: AppSidebarItem = { title: "Test", isActive: true };
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should return true when URL matches current route", () => {
			const item: AppSidebarItem = { title: "Test", url: "/test" };
			expect(isItemActive(item, "/test")).toBe(true);
		});

		it("should return false when URL does not match", () => {
			const item: AppSidebarItem = { title: "Test", url: "/other" };
			expect(isItemActive(item, "/test")).toBe(false);
		});

		it("should check children recursively", () => {
			const item: AppSidebarItem = {
				title: "Parent",
				items: [{ title: "Child", url: "/child" }],
			};
			expect(isItemActive(item, "/child")).toBe(true);
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
		it("should filter out invisible items", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Visible", visible: true },
				{ title: "Invisible", visible: false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Visible", "Default"]);
		});

		it("should filter out inaccessible items", async () => {
			const items: AppSidebarItem[] = [
				{ title: "Accessible", canAccess: () => true },
				{ title: "Inaccessible", canAccess: () => false },
				{ title: "Default" },
			];

			const filtered = await filterNavItems(items);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((i) => i.title)).toEqual(["Accessible", "Default"]);
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
});
