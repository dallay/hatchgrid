import { mount } from "@vue/test-utils";
import { Bot, Settings2 } from "lucide-vue-next";
import { describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import AppSidebarItem from "./AppSidebarItem.vue";
import type { AppSidebarItem as AppSidebarItemType } from "./types";

// Mock the sidebar context
vi.mock("@/components/ui/sidebar", () => ({
	SidebarMenuButton: {
		name: "SidebarMenuButton",
		props: ["tooltip", "isActive", "as", "href", "ariaExpanded", "ariaLabel"],
		template: `<button v-bind="$attrs" :data-tooltip="tooltip" :data-active="isActive" :aria-label="ariaLabel" :aria-expanded="ariaExpanded"><slot /></button>`,
	},
	SidebarMenuItem: {
		name: "SidebarMenuItem",
		template: "<li><slot /></li>",
	},
	SidebarMenuSub: {
		name: "SidebarMenuSub",
		template: "<ul><slot /></ul>",
	},
	SidebarMenuSubButton: {
		name: "SidebarMenuSubButton",
		props: ["isActive", "as", "href", "ariaExpanded", "ariaLabel"],
		template: `<button v-bind="$attrs" :data-active="isActive" :aria-label="ariaLabel" :aria-expanded="ariaExpanded"><slot /></button>`,
	},
	SidebarMenuSubItem: {
		name: "SidebarMenuSubItem",
		template: "<li><slot /></li>",
	},
}));

// Mock collapsible components
vi.mock("@/components/ui/collapsible", () => ({
	Collapsible: {
		name: "Collapsible",
		template: "<div><slot /></div>",
	},
	CollapsibleContent: {
		name: "CollapsibleContent",
		template: "<div><slot /></div>",
	},
	CollapsibleTrigger: {
		name: "CollapsibleTrigger",
		template: "<div><slot /></div>",
	},
}));

// Mock router
const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: { template: "<div>Home</div>" } },
		{ path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
		{ path: "/settings", component: { template: "<div>Settings</div>" } },
	],
});

describe("AppSidebarItem", () => {
	it("renders a simple item without URL", async () => {
		const item: AppSidebarItemType = {
			title: "Category",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Category");
	});

	it("renders a simple item with URL", async () => {
		const item: AppSidebarItemType = {
			title: "Dashboard",
			url: "/dashboard",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Dashboard");
	});

	it("renders item with children as collapsible", async () => {
		const item: AppSidebarItemType = {
			title: "Settings",
			icon: Settings2,
			items: [
				{ title: "General", url: "/settings/general" },
				{ title: "Security", url: "/settings/security" },
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Settings");
		expect(wrapper.text()).toContain("General");
		expect(wrapper.text()).toContain("Security");
	});

	it("renders nested items recursively", async () => {
		const item: AppSidebarItemType = {
			title: "Admin",
			items: [
				{
					title: "Users",
					items: [
						{ title: "List Users", url: "/admin/users" },
						{ title: "Add User", url: "/admin/users/add" },
					],
				},
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Admin");
		expect(wrapper.text()).toContain("Users");
		expect(wrapper.text()).toContain("List Users");
		expect(wrapper.text()).toContain("Add User");
	});

	it("handles different nesting levels", async () => {
		const item: AppSidebarItemType = {
			title: "Level 1",
			items: [{ title: "Level 2 Item", url: "/level2" }],
		};

		// Test level 0 (root)
		const rootWrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		expect(rootWrapper.text()).toContain("Level 1");
		expect(rootWrapper.text()).toContain("Level 2 Item");

		// Test level 1 (nested)
		const nestedItem: AppSidebarItemType = {
			title: "Nested Item",
			url: "/nested",
		};

		const nestedWrapper = mount(AppSidebarItem, {
			props: { item: nestedItem, level: 1 },
			global: {
				plugins: [router],
			},
		});

		expect(nestedWrapper.text()).toContain("Nested Item");
	});

	it("passes tooltip text to SidebarMenuButton for root level items", async () => {
		const item: AppSidebarItemType = {
			title: "Dashboard",
			url: "/dashboard",
			tooltip: "Go to Dashboard",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.props("tooltip")).toBe("Go to Dashboard");
	});

	it("falls back to item title when no custom tooltip is provided", async () => {
		const item: AppSidebarItemType = {
			title: "Settings",
			url: "/settings",
			icon: Settings2,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.props("tooltip")).toBe("Settings");
	});

	it("provides fallback tooltip text for items without title", async () => {
		const item: AppSidebarItemType = {
			title: "",
			url: "/empty",
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.props("tooltip")).toBe("Navigation Item");
	});

	it("handles accessibility attributes correctly for collapsible items", async () => {
		const item: AppSidebarItemType = {
			title: "Settings",
			icon: Settings2,
			items: [{ title: "General", url: "/settings/general" }],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.attributes("aria-label")).toBe("Settings menu, collapsed");
		expect(menuButton.attributes("aria-expanded")).toBe("false");
	});

	it("handles keyboard navigation and focus management", async () => {
		const item: AppSidebarItemType = {
			title: "Dashboard",
			url: "/dashboard",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.attributes("tabindex")).not.toBe("-1");
	});

	it("renders collapsible items with proper structure", async () => {
		const item: AppSidebarItemType = {
			title: "Settings",
			icon: Settings2,
			items: [
				{ title: "General", url: "/settings/general" },
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.exists()).toBe(true);
		expect(wrapper.text()).toContain("Settings");
		expect(wrapper.text()).toContain("General");
	});

	it("handles items with active children", async () => {
		const item: AppSidebarItemType = {
			title: "Admin",
			items: [
				{
					title: "Users",
					url: "/admin/users",
					isActive: true,
				},
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		// Should render the parent and child items
		expect(wrapper.text()).toContain("Admin");
		expect(wrapper.text()).toContain("Users");

		// Should have a collapsible structure
		const collapsible = wrapper.findComponent({ name: "Collapsible" });
		expect(collapsible.exists()).toBe(true);
	});

	it("handles malformed items gracefully", async () => {
		const item: AppSidebarItemType = {
			title: "Valid Title",
			// Filter out null/undefined items to simulate real-world filtering
			items: [{ title: "Valid Item" }, { title: "" }],
		};

		// Should not throw an error
		expect(() => {
			mount(AppSidebarItem, {
				props: { item },
				global: {
					plugins: [router],
				},
			});
		}).not.toThrow();
	});

	it("handles deeply nested structures efficiently", async () => {
		const createNestedItem = (depth: number): AppSidebarItemType => ({
			title: `Level ${depth}`,
			items: depth > 0 ? [createNestedItem(depth - 1)] : undefined,
		});

		const deepItem = createNestedItem(5);

		const wrapper = mount(AppSidebarItem, {
			props: { item: deepItem },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Level 5");
		expect(wrapper.text()).toContain("Level 0");
	});

	it("optimizes rendering with filtered children", async () => {
		const item: AppSidebarItemType = {
			title: "Parent",
			items: [
				{ title: "Valid Child" },
				{ title: "" }, // Should be filtered out
				{ title: "   " }, // Should be filtered out (whitespace only)
				{ title: "Another Valid Child" },
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item },
			global: {
				plugins: [router],
			},
		});

		expect(wrapper.text()).toContain("Valid Child");
		expect(wrapper.text()).toContain("Another Valid Child");
		// Should only render valid children
		const childComponents = wrapper.findAllComponents(AppSidebarItem);
		expect(childComponents.length).toBe(2); // 2 valid children (parent is not included in findAllComponents)
	});
});
