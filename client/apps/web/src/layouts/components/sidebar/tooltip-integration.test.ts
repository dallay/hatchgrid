import { mount } from "@vue/test-utils";
import { Bot } from "lucide-vue-next";
import { describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import AppSidebarItem from "./AppSidebarItem.vue";
import type { AppSidebarItem as AppSidebarItemType } from "./types";

// Mock the sidebar context with tooltip support
vi.mock("@/components/ui/sidebar", () => ({
	SidebarMenuButton: {
		name: "SidebarMenuButton",
		props: ["tooltip", "isActive", "as", "href"],
		template: `<button v-bind="$attrs" :data-tooltip="tooltip"><slot /></button>`,
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
		template: `<button v-bind="$attrs"><slot /></button>`,
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
	],
});

describe("AppSidebarItem Tooltip Integration", () => {
	it("should integrate with existing tooltip component (Requirement 5.2)", async () => {
		const item: AppSidebarItemType = {
			title: "Dashboard",
			url: "/dashboard",
			tooltip: "Navigate to Dashboard",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		// Verify that the tooltip is passed to SidebarMenuButton
		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.exists()).toBe(true);
		expect(menuButton.props("tooltip")).toBe("Navigate to Dashboard");
	});

	it("should show tooltip when sidebar is collapsed (Requirement 1.5)", async () => {
		const item: AppSidebarItemType = {
			title: "Settings",
			tooltip: "Application Settings",
			icon: Bot,
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		// The tooltip should be passed to the SidebarMenuButton
		// The actual collapsed state logic is handled by SidebarMenuButton component
		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.props("tooltip")).toBe("Application Settings");
	});

	it("should show tooltips with item titles or custom tooltip text (Requirement 5.5)", async () => {
		// Test with custom tooltip text
		const itemWithCustomTooltip: AppSidebarItemType = {
			title: "Dashboard",
			tooltip: "Go to main dashboard",
			icon: Bot,
		};

		const wrapperCustom = mount(AppSidebarItem, {
			props: { item: itemWithCustomTooltip, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButtonCustom = wrapperCustom.findComponent({
			name: "SidebarMenuButton",
		});
		expect(menuButtonCustom.props("tooltip")).toBe("Go to main dashboard");

		// Test with fallback to item title
		const itemWithoutTooltip: AppSidebarItemType = {
			title: "Settings",
			icon: Bot,
		};

		const wrapperFallback = mount(AppSidebarItem, {
			props: { item: itemWithoutTooltip, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButtonFallback = wrapperFallback.findComponent({
			name: "SidebarMenuButton",
		});
		expect(menuButtonFallback.props("tooltip")).toBe("Settings");
	});

	it("should provide fallback tooltip for items without title", async () => {
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
		expect(menuButton.props("tooltip")).toBe("Untitled Item");
	});

	it("should handle tooltip for items with children", async () => {
		const item: AppSidebarItemType = {
			title: "Admin",
			tooltip: "Administration Panel",
			icon: Bot,
			items: [
				{ title: "Users", url: "/admin/users" },
				{ title: "Settings", url: "/admin/settings" },
			],
		};

		const wrapper = mount(AppSidebarItem, {
			props: { item, level: 0 },
			global: {
				plugins: [router],
			},
		});

		const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
		expect(menuButton.props("tooltip")).toBe("Administration Panel");
	});
});
