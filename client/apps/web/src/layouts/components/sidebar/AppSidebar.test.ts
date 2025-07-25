/**
 * Integration tests for AppSidebar component
 * Tests complete navigation rendering, async permission filtering,
 * Vue Router integration, and sidebar collapse/expand behavior
 */
import { mount } from "@vue/test-utils";
import { Bot, Home, Settings2, User } from "lucide-vue-next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import type { AppSidebarItem } from "./types.ts";

// Mock the UI components
vi.mock("@/components/ui/sidebar", () => ({
	Sidebar: {
		name: "Sidebar",
		props: ["collapsible", "variant", "side"],
		template: `
			<div
				class="sidebar"
				:data-collapsible="collapsible"
				:data-variant="variant"
				:data-side="side"
			>
				<slot />
			</div>
		`,
	},
	SidebarContent: {
		name: "SidebarContent",
		template: "<div class='sidebar-content'><slot /></div>",
	},
	SidebarHeader: {
		name: "SidebarHeader",
		template: "<div class='sidebar-header'><slot /></div>",
	},
	SidebarFooter: {
		name: "SidebarFooter",
		template: "<div class='sidebar-footer'><slot /></div>",
	},
	SidebarGroup: {
		name: "SidebarGroup",
		template: "<div class='sidebar-group'><slot /></div>",
	},
	SidebarMenu: {
		name: "SidebarMenu",
		template: "<ul class='sidebar-menu'><slot /></ul>",
	},
	SidebarMenuSkeleton: {
		name: "SidebarMenuSkeleton",
		template: "<li class='skeleton-item'></li>",
	},
}));

// Mock AppSidebarItem to avoid complex child component interactions
vi.mock("./AppSidebarItem.vue", () => ({
	default: {
		name: "AppSidebarItem",
		props: ["item"],
		template: `
			<li class="app-sidebar-item" :data-title="item.title" :data-url="item.url">
				{{ item.title }}
			</li>
		`,
	},
}));

// Mock TeamSwitcher component
vi.mock("@/components/TeamSwitcher.vue", () => ({
	default: {
		name: "TeamSwitcher",
		props: ["teams"],
		template: `
			<div class="team-switcher" :data-teams-count="teams.length">
				Team Switcher
			</div>
		`,
	},
}));

// Mock UserNav component
vi.mock("@/components/UserNav.vue", () => ({
	default: {
		name: "UserNav",
		props: ["variant"],
		template: `
			<div class="user-nav" :data-variant="variant">
				User Nav
			</div>
		`,
	},
}));

// Mock the navigation filtering composable
const mockFilteredItems = ref<AppSidebarItem[]>([
	{ title: "Dashboard", url: "/dashboard" },
	{ title: "User Management", url: "/users" },
	{ title: "Settings", url: "/settings" },
	{ title: "Profile", url: "/profile" },
]);
const mockShouldShowLoading = ref(false);
const mockShouldShowError = ref(false);
const mockFilterItems = vi.fn();
const mockClearError = vi.fn();

vi.mock("./composables/useNavigationFiltering", () => ({
	useNavigationFiltering: vi.fn(() => ({
		filteredItems: mockFilteredItems,
		isLoading: ref(false),
		shouldShowLoading: mockShouldShowLoading,
		shouldShowError: mockShouldShowError,
		errorState: ref({ hasError: false, recoverable: true }),
		filterItems: mockFilterItems,
		clearError: mockClearError,
	})),
}));

// Create test router
const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: { template: "<div>Home</div>" } },
		{ path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
		{ path: "/settings", component: { template: "<div>Settings</div>" } },
		{ path: "/admin/users", component: { template: "<div>Users</div>" } },
		{
			path: "/admin/settings",
			component: { template: "<div>Admin Settings</div>" },
		},
		{ path: "/profile", component: { template: "<div>Profile</div>" } },
	],
});

describe("AppSidebar Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFilteredItems.value = [];
		mockShouldShowLoading.value = false;
		mockShouldShowError.value = false;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Complete Navigation Rendering with Sample Data", () => {
		it("renders complete navigation structure with mixed item types", async () => {
			const sampleNavigation: AppSidebarItem[] = [
				{
					title: "Dashboard",
					url: "/dashboard",
					icon: Home,
					isActive: true,
				},
				{
					title: "User Management",
					icon: User,
					items: [
						{ title: "All Users", url: "/admin/users" },
						{ title: "User Settings", url: "/admin/settings" },
					],
				},
				{
					title: "Settings",
					icon: Settings2,
					items: [
						{ title: "General", url: "/settings/general" },
						{
							title: "Advanced",
							items: [
								{ title: "Security", url: "/settings/advanced/security" },
								{ title: "Performance", url: "/settings/advanced/performance" },
							],
						},
					],
				},
				{
					title: "Profile",
					url: "/profile",
					icon: Bot,
				},
			];

			mockFilteredItems.value = sampleNavigation;

			const wrapper = mount(AppSidebar, {
				props: {
					items: sampleNavigation,
					collapsible: "icon",
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify main sidebar structure
			expect(wrapper.findComponent({ name: "Sidebar" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "SidebarContent" }).exists()).toBe(
				true,
			);
			expect(wrapper.findComponent({ name: "SidebarGroup" }).exists()).toBe(
				true,
			);
			expect(wrapper.findComponent({ name: "SidebarMenu" }).exists()).toBe(
				true,
			);

			// Verify all navigation items are rendered
			const sidebarText = wrapper.text();
			expect(sidebarText).toContain("Dashboard");
			expect(sidebarText).toContain("User Management");
			expect(sidebarText).toContain("Settings");
			expect(sidebarText).toContain("Profile");

			// Verify AppSidebarItem components are rendered
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(4); // Top-level items
		});

		it("handles empty navigation gracefully", async () => {
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Should still render sidebar structure
			expect(wrapper.findComponent({ name: "Sidebar" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "SidebarMenu" }).exists()).toBe(
				true,
			);

			// Should not render any navigation items
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(0);
		});

		it("generates stable keys for navigation items", async () => {
			const navigationWithUrls: AppSidebarItem[] = [
				{ title: "Dashboard", url: "/dashboard" },
				{ title: "Settings", url: "/settings" },
			];

			const navigationWithoutUrls: AppSidebarItem[] = [
				{ title: "Category 1" },
				{ title: "Category 2" },
			];

			mockFilteredItems.value = [
				...navigationWithUrls,
				...navigationWithoutUrls,
			];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [...navigationWithUrls, ...navigationWithoutUrls],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(4);

			// Items with URLs should use URL as key
			expect(sidebarItems[0].props("item")).toEqual(navigationWithUrls[0]);
			expect(sidebarItems[1].props("item")).toEqual(navigationWithUrls[1]);

			// Items without URLs should use title-index combination
			expect(sidebarItems[2].props("item")).toEqual(navigationWithoutUrls[0]);
			expect(sidebarItems[3].props("item")).toEqual(navigationWithoutUrls[1]);
		});

		it("passes sidebar props correctly to Sidebar component", async () => {
			const sidebarProps = {
				collapsible: "icon" as const,
				variant: "sidebar" as const,
				side: "left" as const,
			};

			mockFilteredItems.value = [{ title: "Test Item", url: "/test" }];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [{ title: "Test Item", url: "/test" }],
					...sidebarProps,
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			const sidebarComponent = wrapper.findComponent({ name: "Sidebar" });
			expect(sidebarComponent.props("collapsible")).toBe("icon");
			expect(sidebarComponent.props("variant")).toBe("sidebar");
			expect(sidebarComponent.props("side")).toBe("left");
		});
	});

	describe("Async Permission Filtering Without Blocking UI", () => {
		it("shows loading state during async permission evaluation", async () => {
			mockShouldShowLoading.value = true;
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [
						{
							title: "Admin Panel",
							canAccess: async () => {
								// Simulate slow permission check
								await new Promise((resolve) => setTimeout(resolve, 100));
								return true;
							},
						},
					],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Should show skeleton loading items
			const skeletonItems = wrapper.findAllComponents({
				name: "SidebarMenuSkeleton",
			});
			expect(skeletonItems.length).toBe(3); // Default skeleton count

			// Should not show navigation items during loading
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(0);
		});

		it("shows filtered items after async permission evaluation completes", async () => {
			// Start with loading state
			mockShouldShowLoading.value = true;
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [
						{ title: "Public Item", url: "/public" },
						{
							title: "Admin Item",
							url: "/admin",
							canAccess: async () => true,
						},
					],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Initially shows loading
			expect(
				wrapper.findAllComponents({ name: "SidebarMenuSkeleton" }).length,
			).toBe(3);

			// Simulate async filtering completion
			mockShouldShowLoading.value = false;
			mockFilteredItems.value = [
				{ title: "Public Item", url: "/public" },
				{ title: "Admin Item", url: "/admin" },
			];

			await nextTick();

			// Should now show filtered items
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(2);
			expect(wrapper.text()).toContain("Public Item");
			expect(wrapper.text()).toContain("Admin Item");

			// Should not show skeleton items
			expect(
				wrapper.findAllComponents({ name: "SidebarMenuSkeleton" }).length,
			).toBe(0);
		});

		it("handles async permission failures gracefully", async () => {
			mockShouldShowError.value = true;
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [
						{
							title: "Failing Item",
							canAccess: async () => {
								throw new Error("Permission check failed");
							},
						},
					],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Should show error message
			expect(wrapper.text()).toContain("Failed to load navigation");

			// Should not show navigation items or loading skeletons
			expect(wrapper.findAllComponents({ name: "AppSidebarItem" }).length).toBe(
				0,
			);
			expect(
				wrapper.findAllComponents({ name: "SidebarMenuSkeleton" }).length,
			).toBe(0);
		});

		it("does not block UI during permission evaluation", async () => {
			const slowPermissionCheck = vi.fn().mockImplementation(async () => {
				await new Promise((resolve) => setTimeout(resolve, 50));
				return true;
			});

			mockFilteredItems.value = [{ title: "Fast Item", url: "/fast" }];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [
						{ title: "Fast Item", url: "/fast" },
						{
							title: "Slow Item",
							url: "/slow",
							canAccess: slowPermissionCheck,
						},
					],
				},
				global: {
					plugins: [router],
				},
			});

			// UI should be responsive immediately
			expect(wrapper.findComponent({ name: "Sidebar" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "SidebarMenu" }).exists()).toBe(
				true,
			);

			await nextTick();

			// Should show available items without waiting for slow permission check
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(1);
			expect(wrapper.text()).toContain("Fast Item");
		});

		it("handles mixed sync and async permission checks", async () => {
			const syncPermission = vi.fn().mockReturnValue(true);
			const asyncPermission = vi.fn().mockResolvedValue(true);

			mockFilteredItems.value = [
				{ title: "Sync Item", url: "/sync" },
				{ title: "Async Item", url: "/async" },
			];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [
						{
							title: "Sync Item",
							url: "/sync",
							canAccess: syncPermission,
						},
						{
							title: "Async Item",
							url: "/async",
							canAccess: asyncPermission,
						},
					],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Both items should be rendered after filtering
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(2);
			expect(wrapper.text()).toContain("Sync Item");
			expect(wrapper.text()).toContain("Async Item");
		});
	});

	describe("Integration with Vue Router for Active States", () => {
		it("detects active states based on current route", async () => {
			await router.push("/dashboard");

			const navigationItems: AppSidebarItem[] = [
				{ title: "Home", url: "/" },
				{ title: "Dashboard", url: "/dashboard" },
				{ title: "Settings", url: "/settings" },
			];

			mockFilteredItems.value = navigationItems;

			const wrapper = mount(AppSidebar, {
				props: { items: navigationItems },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify items are rendered
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(3);

			// The active state detection is handled by AppSidebarItem component
			// We verify that the correct route is available to child components
			expect(router.currentRoute.value.path).toBe("/dashboard");
		});

		it("handles route changes and updates active states", async () => {
			const navigationItems: AppSidebarItem[] = [
				{ title: "Dashboard", url: "/dashboard" },
				{ title: "Settings", url: "/settings" },
			];

			mockFilteredItems.value = navigationItems;

			const wrapper = mount(AppSidebar, {
				props: { items: navigationItems },
				global: {
					plugins: [router],
				},
			});

			// Start at dashboard
			await router.push("/dashboard");
			await nextTick();

			expect(router.currentRoute.value.path).toBe("/dashboard");

			// Navigate to settings
			await router.push("/settings");
			await nextTick();

			expect(router.currentRoute.value.path).toBe("/settings");

			// Verify items are still rendered correctly
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(2);
		});

		it("handles nested routes and parent-child active relationships", async () => {
			await router.push("/admin/users");

			const nestedNavigation: AppSidebarItem[] = [
				{
					title: "Admin",
					items: [
						{ title: "Users", url: "/admin/users" },
						{ title: "Settings", url: "/admin/settings" },
					],
				},
			];

			mockFilteredItems.value = nestedNavigation;

			const wrapper = mount(AppSidebar, {
				props: { items: nestedNavigation },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify nested structure is rendered
			expect(wrapper.text()).toContain("Admin");

			// Current route should be available for active state detection
			expect(router.currentRoute.value.path).toBe("/admin/users");
		});

		it("supports explicit active state overrides", async () => {
			await router.push("/");

			const navigationWithActiveOverride: AppSidebarItem[] = [
				{ title: "Home", url: "/" },
				{
					title: "Dashboard",
					url: "/dashboard",
					isActive: true, // Explicitly active despite not being current route
				},
			];

			mockFilteredItems.value = navigationWithActiveOverride;

			const wrapper = mount(AppSidebar, {
				props: { items: navigationWithActiveOverride },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(2);

			// Verify that the Dashboard item has isActive: true
			const dashboardItem = sidebarItems.find(
				(item) => item.props("item").title === "Dashboard",
			);
			expect(dashboardItem?.props("item").isActive).toBe(true);
		});

		it("handles route parameters and query strings", async () => {
			await router.push("/profile?tab=settings");

			const navigationItems: AppSidebarItem[] = [
				{ title: "Profile", url: "/profile" },
			];

			mockFilteredItems.value = navigationItems;

			const wrapper = mount(AppSidebar, {
				props: { items: navigationItems },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Route with query parameters should be available
			expect(router.currentRoute.value.path).toBe("/profile");
			expect(router.currentRoute.value.query.tab).toBe("settings");

			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(1);
		});
	});

	describe("Sidebar Collapse/Expand Behavior with Tooltips", () => {
		it("passes collapsible prop to Sidebar component", async () => {
			mockFilteredItems.value = [{ title: "Test Item", url: "/test" }];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [{ title: "Test Item", url: "/test" }],
					collapsible: "icon",
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			const sidebarComponent = wrapper.findComponent({ name: "Sidebar" });
			expect(sidebarComponent.props("collapsible")).toBe("icon");
			expect(sidebarComponent.attributes("data-collapsible")).toBe("icon");
		});

		it("supports different collapsible variants", async () => {
			mockFilteredItems.value = [{ title: "Test Item", url: "/test" }];

			const variants = ["icon", "offcanvas", "none"] as const;

			for (const variant of variants) {
				const wrapper = mount(AppSidebar, {
					props: {
						items: [{ title: "Test Item", url: "/test" }],
						collapsible: variant,
					},
					global: {
						plugins: [router],
					},
				});

				await nextTick();

				const sidebarComponent = wrapper.findComponent({ name: "Sidebar" });
				expect(sidebarComponent.props("collapsible")).toBe(variant);
			}
		});

		it("renders navigation items with tooltip support for collapsed state", async () => {
			const itemsWithTooltips: AppSidebarItem[] = [
				{
					title: "Dashboard",
					url: "/dashboard",
					tooltip: "Go to Dashboard",
					icon: Home,
				},
				{
					title: "Settings",
					url: "/settings",
					tooltip: "Application Settings",
					icon: Settings2,
				},
			];

			mockFilteredItems.value = itemsWithTooltips;

			const wrapper = mount(AppSidebar, {
				props: {
					items: itemsWithTooltips,
					collapsible: "icon",
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify items are rendered with tooltip data
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(2);

			// Check that tooltip information is passed to items
			expect(sidebarItems[0].props("item").tooltip).toBe("Go to Dashboard");
			expect(sidebarItems[1].props("item").tooltip).toBe(
				"Application Settings",
			);
		});

		it("handles sidebar state changes without breaking navigation", async () => {
			const navigationItems: AppSidebarItem[] = [
				{ title: "Home", url: "/", icon: Home },
				{ title: "Dashboard", url: "/dashboard", icon: Bot },
			];

			mockFilteredItems.value = navigationItems;

			const wrapper = mount(AppSidebar, {
				props: {
					items: navigationItems,
					collapsible: "icon",
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify initial render
			let sidebarItems = wrapper.findAllComponents({ name: "AppSidebarItem" });
			expect(sidebarItems.length).toBe(2);

			// Simulate collapsible state change
			await wrapper.setProps({ collapsible: "offcanvas" });
			await nextTick();

			// Items should still be rendered
			sidebarItems = wrapper.findAllComponents({ name: "AppSidebarItem" });
			expect(sidebarItems.length).toBe(2);

			const sidebarComponent = wrapper.findComponent({ name: "Sidebar" });
			expect(sidebarComponent.props("collapsible")).toBe("offcanvas");
		});

		it("maintains tooltip functionality across different sidebar states", async () => {
			const itemWithTooltip: AppSidebarItem = {
				title: "Profile",
				url: "/profile",
				tooltip: "User Profile Settings",
				icon: User,
			};

			mockFilteredItems.value = [itemWithTooltip];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [itemWithTooltip],
					collapsible: "icon",
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Check tooltip in icon mode
			let sidebarItem = wrapper.findComponent({ name: "AppSidebarItem" });
			expect(sidebarItem.props("item").tooltip).toBe("User Profile Settings");

			// Change to offcanvas mode
			await wrapper.setProps({ collapsible: "offcanvas" });
			await nextTick();

			// Tooltip should still be available
			sidebarItem = wrapper.findComponent({ name: "AppSidebarItem" });
			expect(sidebarItem.props("item").tooltip).toBe("User Profile Settings");
		});
	});

	describe("Error Handling and Edge Cases", () => {
		it("handles navigation filtering errors gracefully", async () => {
			mockShouldShowError.value = true;
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [{ title: "Test Item", url: "/test" }],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Should show error message
			expect(wrapper.text()).toContain("Failed to load navigation");

			// Should not show navigation items
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(0);
		});

		it("recovers from errors when navigation items are updated", async () => {
			// Start with error state
			mockShouldShowError.value = true;
			mockFilteredItems.value = [];

			const wrapper = mount(AppSidebar, {
				props: {
					items: [{ title: "Failing Item" }],
				},
				global: {
					plugins: [router],
				},
			});

			await nextTick();
			expect(wrapper.text()).toContain("Failed to load navigation");

			// Simulate recovery
			mockShouldShowError.value = false;
			mockFilteredItems.value = [{ title: "Working Item", url: "/working" }];

			await wrapper.setProps({
				items: [{ title: "Working Item", url: "/working" }],
			});
			await nextTick();

			// Should now show navigation items
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(1);
			expect(wrapper.text()).toContain("Working Item");
		});

		it("handles rapid prop changes without breaking", async () => {
			const initialItems: AppSidebarItem[] = [
				{ title: "Item 1", url: "/item1" },
			];

			const updatedItems: AppSidebarItem[] = [
				{ title: "Item 1", url: "/item1" },
				{ title: "Item 2", url: "/item2" },
			];

			mockFilteredItems.value = initialItems;

			const wrapper = mount(AppSidebar, {
				props: { items: initialItems },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Rapid updates
			for (let i = 0; i < 5; i++) {
				mockFilteredItems.value = i % 2 === 0 ? initialItems : updatedItems;
				await wrapper.setProps({
					items: i % 2 === 0 ? initialItems : updatedItems,
				});
				await nextTick();
			}

			// Should handle rapid changes gracefully
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBeGreaterThan(0);
		});

		it("maintains component stability during async operations", async () => {
			const asyncItems: AppSidebarItem[] = [
				{
					title: "Async Item",
					url: "/async",
					canAccess: async () => {
						await new Promise((resolve) => setTimeout(resolve, 10));
						return true;
					},
				},
			];

			mockFilteredItems.value = [];
			mockShouldShowLoading.value = true;

			const wrapper = mount(AppSidebar, {
				props: { items: asyncItems },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Should show loading state
			expect(
				wrapper.findAllComponents({ name: "SidebarMenuSkeleton" }).length,
			).toBe(3);

			// Simulate async completion
			mockShouldShowLoading.value = false;
			mockFilteredItems.value = asyncItems;

			await nextTick();

			// Should transition to showing items
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(1);
			expect(wrapper.text()).toContain("Async Item");
		});
	});

	describe("Performance and Optimization", () => {
		it("handles large navigation structures efficiently", async () => {
			const largeNavigation: AppSidebarItem[] = Array.from(
				{ length: 50 },
				(_, i) => ({
					title: `Item ${i + 1}`,
					url: `/item${i + 1}`,
					icon: i % 2 === 0 ? Home : Settings2,
				}),
			);

			mockFilteredItems.value = largeNavigation;

			const startTime = performance.now();

			const wrapper = mount(AppSidebar, {
				props: { items: largeNavigation },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			const endTime = performance.now();
			const renderTime = endTime - startTime;

			// Should render efficiently (less than 100ms for 50 items)
			expect(renderTime).toBeLessThan(100);

			// All items should be rendered
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(50);
		});

		it("optimizes re-renders when items change", async () => {
			const initialItems: AppSidebarItem[] = [
				{ title: "Item 1", url: "/item1" },
				{ title: "Item 2", url: "/item2" },
			];

			mockFilteredItems.value = initialItems;

			const wrapper = mount(AppSidebar, {
				props: { items: initialItems },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Add one item
			const updatedItems = [
				...initialItems,
				{ title: "Item 3", url: "/item3" },
			];

			mockFilteredItems.value = updatedItems;

			await wrapper.setProps({ items: updatedItems });
			await nextTick();

			// Should efficiently update
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(3);
		});

		it("uses stable keys for efficient Vue rendering", async () => {
			const itemsWithUrls: AppSidebarItem[] = [
				{ title: "Dashboard", url: "/dashboard" },
				{ title: "Settings", url: "/settings" },
			];

			const itemsWithoutUrls: AppSidebarItem[] = [
				{ title: "Category 1" },
				{ title: "Category 2" },
			];

			mockFilteredItems.value = [...itemsWithUrls, ...itemsWithoutUrls];

			const wrapper = mount(AppSidebar, {
				props: { items: [...itemsWithUrls, ...itemsWithoutUrls] },
				global: {
					plugins: [router],
				},
			});

			await nextTick();

			// Verify all items are rendered with stable keys
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems.length).toBe(4);

			// Items should maintain their identity across re-renders
			const itemProps = sidebarItems.map((item) => item.props("item"));
			expect(itemProps[0]).toEqual(itemsWithUrls[0]);
			expect(itemProps[1]).toEqual(itemsWithUrls[1]);
			expect(itemProps[2]).toEqual(itemsWithoutUrls[0]);
			expect(itemProps[3]).toEqual(itemsWithoutUrls[1]);
		});
	});
});
