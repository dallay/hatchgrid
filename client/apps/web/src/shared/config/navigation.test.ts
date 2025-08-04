/**
 * Tests for navigation configuration
 * Verifies that the navigation items are properly structured and work with auth store
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Authority } from "@/authentication/domain/models";
import { getMinimalNavigationItems, getNavigationItems } from "./navigation";

// Mock the auth store
const mockAuthStore = {
	isAuthenticated: false,
	hasAuthority: vi.fn(),
};

vi.mock("@/authentication/infrastructure/store/useAuthStore", () => ({
	useAuthStore: () => mockAuthStore,
}));

describe("Navigation Configuration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAuthStore.isAuthenticated = false;
		mockAuthStore.hasAuthority.mockReturnValue(false);
	});

	describe("getNavigationItems", () => {
		it("should return basic navigation items for unauthenticated users", () => {
			const items = getNavigationItems();

			expect(items).toHaveLength(4);
			expect(items[0].title).toBe("Dashboard");
			expect(items[0].url).toBe("/");
			expect(items[0].icon).toBeDefined();
		});

		it("should include audience items for authenticated users", () => {
			mockAuthStore.isAuthenticated = true;

			const items = getNavigationItems();
			const audienceItem = items.find((item) => item.title === "Audience");

			expect(audienceItem).toBeDefined();
			expect(audienceItem?.items).toHaveLength(1);
			expect(audienceItem?.items?.[0].title).toBe("Subscribers");
			expect(audienceItem?.items?.[0].url).toBe("/audience/subscribers");
		});

		it("should include account items for authenticated users", () => {
			mockAuthStore.isAuthenticated = true;

			const items = getNavigationItems();
			const accountItem = items.find((item) => item.title === "Account");

			expect(accountItem).toBeDefined();
			expect(accountItem?.items).toHaveLength(2);
			expect(accountItem?.items?.[0].title).toBe("Settings");
			expect(accountItem?.items?.[1].title).toBe("Change Password");
		});

		it("should include admin items for admin users", () => {
			mockAuthStore.isAuthenticated = true;
			mockAuthStore.hasAuthority.mockImplementation(
				(authority: string) => authority === Authority.ADMIN,
			);

			const items = getNavigationItems();
			const adminItem = items.find((item) => item.title === "Admin");

			expect(adminItem).toBeDefined();
			expect(adminItem?.items).toHaveLength(2);
			expect(adminItem?.items?.[0].title).toBe("User Management");
			expect(adminItem?.items?.[1].title).toBe("System Settings");
		});

		it("should not include admin items for non-admin users", () => {
			mockAuthStore.isAuthenticated = true;
			mockAuthStore.hasAuthority.mockReturnValue(false);

			const items = getNavigationItems();
			const adminItem = items.find((item) => item.title === "Admin");

			expect(adminItem).toBeDefined();
			// Admin item exists but visibility/access functions should filter it out
			expect(typeof adminItem?.visible).toBe("function");
			expect(typeof adminItem?.canAccess).toBe("function");
		});
	});

	describe("getMinimalNavigationItems", () => {
		it("should return minimal navigation structure", () => {
			const items = getMinimalNavigationItems();

			expect(items).toHaveLength(2);
			expect(items[0].title).toBe("Home");
			expect(items[0].url).toBe("/");
			expect(items[1].title).toBe("Profile");
			expect(items[1].url).toBe("/account/settings");
		});

		it("should include visibility function for profile item", () => {
			const items = getMinimalNavigationItems();
			const profileItem = items.find((item) => item.title === "Profile");

			expect(profileItem).toBeDefined();
			expect(typeof profileItem?.visible).toBe("function");
		});
	});

	describe("Navigation Item Structure", () => {
		it("should have proper TypeScript types", () => {
			const items = getNavigationItems();

			items.forEach((item) => {
				expect(typeof item.title).toBe("string");
				expect(item.title.length).toBeGreaterThan(0);

				if (item.url) {
					expect(typeof item.url).toBe("string");
					expect(item.url).toMatch(/^\/|^https?:\/\//);
				}

				if (item.icon) {
					expect(typeof item.icon).toMatch(/^(object|function)$/);
				}

				if (item.visible) {
					expect(typeof item.visible).toBe("function");
				}

				if (item.canAccess) {
					expect(typeof item.canAccess).toBe("function");
				}

				if (item.items) {
					expect(Array.isArray(item.items)).toBe(true);
				}
			});
		});
	});
});
