import { mount } from "@vue/test-utils";
import { Bot, ChevronRight, Home, Settings2, User } from "lucide-vue-next";
import { describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import AppSidebarItem from "./AppSidebarItem.vue";
import type { AppSidebarItem as AppSidebarItemType } from "./types";

// Mock the sidebar context
vi.mock("@/components/ui/sidebar", () => ({
	SidebarMenuButton: {
		name: "SidebarMenuButton",
		props: [
			"tooltip",
			"isActive",
			"as",
			"href",
			"ariaExpanded",
			"ariaLabel",
			"role",
		],
		template: `<button v-bind="$attrs" :data-tooltip="tooltip" :data-active="isActive" :aria-label="ariaLabel" :aria-expanded="ariaExpanded" :role="role"><slot /></button>`,
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
		props: ["isActive", "as", "href", "ariaExpanded", "ariaLabel", "role"],
		template: `<button v-bind="$attrs" :data-active="isActive" :aria-label="ariaLabel" :aria-expanded="ariaExpanded" :role="role"><slot /></button>`,
	},
	SidebarMenuSubItem: {
		name: "SidebarMenuSubItem",
		template: "<li><slot /></li>",
	},
}));

// Mock collapsible components with state management
vi.mock("@/components/ui/collapsible", () => ({
	Collapsible: {
		name: "Collapsible",
		props: ["defaultOpen", "asChild"],
		data(): { isOpen: boolean } {
			return {
				isOpen:
					(this as unknown as { defaultOpen: boolean }).defaultOpen || false,
			};
		},
		methods: {
			toggle(this: { isOpen: boolean }) {
				this.isOpen = !this.isOpen;
			},
		},
		template: `<div :data-state="isOpen ? 'open' : 'closed'" @click="toggle"><slot /></div>`,
	},
	CollapsibleContent: {
		name: "CollapsibleContent",
		template: "<div class='collapsible-content'><slot /></div>",
	},
	CollapsibleTrigger: {
		name: "CollapsibleTrigger",
		props: ["asChild"],
		template: "<div class='collapsible-trigger'><slot /></div>",
	},
}));

// Mock router
const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: { template: "<div>Home</div>" } },
		{ path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
		{ path: "/settings", component: { template: "<div>Settings</div>" } },
		{ path: "/active", component: { template: "<div>Active</div>" } },
		{ path: "/inactive", component: { template: "<div>Inactive</div>" } },
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
		expect(menuButton.props("tooltip")).toBe("Untitled Item");
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
		expect(menuButton.attributes("aria-label")).toBe(
			"Settings menu, collapsed",
		);
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
			items: [{ title: "General", url: "/settings/general" }],
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

	// Enhanced tests for task requirements
	describe("Recursive Rendering with Nested Menu Structures", () => {
		it("renders deeply nested menu structures correctly", async () => {
			const deeplyNestedItem: AppSidebarItemType = {
				title: "Level 1",
				icon: Bot,
				items: [
					{
						title: "Level 2A",
						url: "/level2a",
						items: [
							{
								title: "Level 3A",
								url: "/level3a",
								items: [
									{ title: "Level 4A", url: "/level4a" },
									{ title: "Level 4B", url: "/level4b" },
								],
							},
							{ title: "Level 3B", url: "/level3b" },
						],
					},
					{
						title: "Level 2B",
						url: "/level2b",
						items: [{ title: "Level 3C", url: "/level3c" }],
					},
				],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: deeplyNestedItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			// Check all levels are rendered
			expect(wrapper.text()).toContain("Level 1");
			expect(wrapper.text()).toContain("Level 2A");
			expect(wrapper.text()).toContain("Level 2B");
			expect(wrapper.text()).toContain("Level 3A");
			expect(wrapper.text()).toContain("Level 3B");
			expect(wrapper.text()).toContain("Level 3C");
			expect(wrapper.text()).toContain("Level 4A");
			expect(wrapper.text()).toContain("Level 4B");

			// Verify recursive component instances
			const nestedComponents = wrapper.findAllComponents(AppSidebarItem);
			expect(nestedComponents.length).toBeGreaterThan(5); // Should have multiple nested instances
		});

		it("handles recursive rendering with mixed item types", async () => {
			const mixedItem: AppSidebarItemType = {
				title: "Mixed Parent",
				items: [
					{ title: "Simple Link", url: "/simple" },
					{
						title: "Category Without URL",
						icon: Settings2,
						items: [
							{ title: "Sub Link 1", url: "/sub1" },
							{ title: "Sub Link 2", url: "/sub2" },
						],
					},
					{ title: "Another Simple Link", url: "/another" },
				],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: mixedItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			expect(wrapper.text()).toContain("Mixed Parent");
			expect(wrapper.text()).toContain("Simple Link");
			expect(wrapper.text()).toContain("Category Without URL");
			expect(wrapper.text()).toContain("Sub Link 1");
			expect(wrapper.text()).toContain("Sub Link 2");
			expect(wrapper.text()).toContain("Another Simple Link");
		});

		it("maintains proper component hierarchy in recursive rendering", async () => {
			const hierarchicalItem: AppSidebarItemType = {
				title: "Root",
				items: [
					{
						title: "Branch 1",
						items: [
							{ title: "Leaf 1.1", url: "/leaf1-1" },
							{ title: "Leaf 1.2", url: "/leaf1-2" },
						],
					},
				],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: hierarchicalItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			// Root level should use SidebarMenuItem
			const rootMenuItem = wrapper.findComponent({ name: "SidebarMenuItem" });
			expect(rootMenuItem.exists()).toBe(true);

			// Nested items should use SidebarMenuSubItem
			const subItems = wrapper.findAllComponents({
				name: "SidebarMenuSubItem",
			});
			expect(subItems.length).toBeGreaterThan(0);
		});
	});

	describe("Conditional Rendering Based on URL Presence", () => {
		it("renders as button when URL is missing", async () => {
			const itemWithoutUrl: AppSidebarItemType = {
				title: "Category Header",
				icon: Bot,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithoutUrl, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("as")).toBe("button");
			expect(menuButton.props("href")).toBeUndefined();
		});

		it("renders as anchor when URL is present", async () => {
			const itemWithUrl: AppSidebarItemType = {
				title: "Dashboard Link",
				url: "/dashboard",
				icon: Bot,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithUrl, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("as")).toBe("a");
			expect(menuButton.props("href")).toBe("/dashboard");
		});

		it("handles empty or whitespace-only URLs correctly", async () => {
			const itemWithEmptyUrl: AppSidebarItemType = {
				title: "Empty URL Item",
				url: "   ",
				icon: Bot,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithEmptyUrl, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			// The component still treats whitespace-only URLs as valid URLs, so it renders as 'a'
			expect(menuButton.props("as")).toBe("a");
			expect(menuButton.props("href")).toBe("   ");
		});

		it("renders different structures for items with and without children", async () => {
			const itemWithChildren: AppSidebarItemType = {
				title: "Parent with Children",
				items: [{ title: "Child", url: "/child" }],
			};

			const itemWithoutChildren: AppSidebarItemType = {
				title: "Simple Item",
				url: "/simple",
			};

			const wrapperWithChildren = mount(AppSidebarItem, {
				props: { item: itemWithChildren, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const wrapperWithoutChildren = mount(AppSidebarItem, {
				props: { item: itemWithoutChildren, level: 0 },
				global: {
					plugins: [router],
				},
			});

			// Item with children should have collapsible structure
			expect(
				wrapperWithChildren.findComponent({ name: "Collapsible" }).exists(),
			).toBe(true);
			expect(
				wrapperWithChildren
					.findComponent({ name: "CollapsibleTrigger" })
					.exists(),
			).toBe(true);
			expect(
				wrapperWithChildren
					.findComponent({ name: "CollapsibleContent" })
					.exists(),
			).toBe(true);

			// Item without children should not have collapsible structure
			expect(
				wrapperWithoutChildren.findComponent({ name: "Collapsible" }).exists(),
			).toBe(false);
		});
	});

	describe("Collapsible Behavior and State Management", () => {
		it("initializes collapsible state based on active status", async () => {
			const activeItem: AppSidebarItemType = {
				title: "Active Parent",
				isActive: true,
				items: [{ title: "Child", url: "/child" }],
			};

			const inactiveItem: AppSidebarItemType = {
				title: "Inactive Parent",
				items: [{ title: "Child", url: "/child" }],
			};

			const activeWrapper = mount(AppSidebarItem, {
				props: { item: activeItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const inactiveWrapper = mount(AppSidebarItem, {
				props: { item: inactiveItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const activeCollapsible = activeWrapper.findComponent({
				name: "Collapsible",
			});
			const inactiveCollapsible = inactiveWrapper.findComponent({
				name: "Collapsible",
			});

			expect(activeCollapsible.props("defaultOpen")).toBe(true);
			expect(inactiveCollapsible.props("defaultOpen")).toBe(false);
		});

		it("expands parent when child is active", async () => {
			// This test verifies that the collapsible behavior works correctly
			// The actual active state detection is tested in the utils tests
			const itemWithChildren: AppSidebarItemType = {
				title: "Parent",
				items: [
					{ title: "Child 1", url: "/child1" },
					{ title: "Child 2", url: "/child2" },
				],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithChildren, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const collapsible = wrapper.findComponent({ name: "Collapsible" });
			// Should be closed by default when no active state
			expect(collapsible.props("defaultOpen")).toBe(false);

			// Test with explicit active state
			const activeItem: AppSidebarItemType = {
				title: "Active Parent",
				isActive: true,
				items: [{ title: "Child 1", url: "/child1" }],
			};

			const activeWrapper = mount(AppSidebarItem, {
				props: { item: activeItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const activeCollapsible = activeWrapper.findComponent({
				name: "Collapsible",
			});
			expect(activeCollapsible.props("defaultOpen")).toBe(true);
		});

		it("handles collapsible toggle interaction", async () => {
			const collapsibleItem: AppSidebarItemType = {
				title: "Collapsible Parent",
				items: [{ title: "Child", url: "/child" }],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: collapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const collapsible = wrapper.findComponent({ name: "Collapsible" });
			const trigger = wrapper.findComponent({ name: "CollapsibleTrigger" });

			// Initial state should be closed
			expect(collapsible.vm.isOpen).toBe(false);

			// Click to toggle
			await trigger.trigger("click");
			expect(collapsible.vm.isOpen).toBe(true);

			// Click again to close
			await trigger.trigger("click");
			expect(collapsible.vm.isOpen).toBe(false);
		});

		it("renders chevron icon with proper rotation state", async () => {
			const collapsibleItem: AppSidebarItemType = {
				title: "Collapsible Item",
				items: [{ title: "Child", url: "/child" }],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: collapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			// Should contain ChevronRight component
			const chevronComponents = wrapper.findAllComponents(ChevronRight);
			expect(chevronComponents.length).toBeGreaterThan(0);

			// Check for rotation classes
			const chevronElement = wrapper.find(".ml-auto");
			expect(chevronElement.exists()).toBe(true);
			expect(chevronElement.classes()).toContain("transition-transform");
		});

		it("maintains collapsible state across different nesting levels", async () => {
			const nestedCollapsibleItem: AppSidebarItemType = {
				title: "Level 1",
				items: [
					{
						title: "Level 2 Collapsible",
						items: [{ title: "Level 3 Item", url: "/level3" }],
					},
				],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: nestedCollapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const collapsibles = wrapper.findAllComponents({ name: "Collapsible" });
			expect(collapsibles.length).toBe(2); // One for each collapsible level
		});
	});

	describe("Icon and Tooltip Rendering", () => {
		it("renders icon when provided", async () => {
			const itemWithIcon: AppSidebarItemType = {
				title: "Item with Icon",
				icon: Bot,
				url: "/icon-item",
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithIcon, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const iconComponent = wrapper.findComponent(Bot);
			expect(iconComponent.exists()).toBe(true);
		});

		it("renders without icon when not provided", async () => {
			const itemWithoutIcon: AppSidebarItemType = {
				title: "Item without Icon",
				url: "/no-icon-item",
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithoutIcon, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const iconComponents = wrapper.findAllComponents(Bot);
			expect(iconComponents.length).toBe(0);
		});

		it("renders different icons for different items", async () => {
			const itemWithBotIcon: AppSidebarItemType = {
				title: "Bot Item",
				icon: Bot,
				url: "/bot",
			};

			const itemWithSettingsIcon: AppSidebarItemType = {
				title: "Settings Item",
				icon: Settings2,
				url: "/settings",
			};

			const botWrapper = mount(AppSidebarItem, {
				props: { item: itemWithBotIcon, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const settingsWrapper = mount(AppSidebarItem, {
				props: { item: itemWithSettingsIcon, level: 0 },
				global: {
					plugins: [router],
				},
			});

			expect(botWrapper.findComponent(Bot).exists()).toBe(true);
			expect(botWrapper.findComponent(Settings2).exists()).toBe(false);

			expect(settingsWrapper.findComponent(Settings2).exists()).toBe(true);
			expect(settingsWrapper.findComponent(Bot).exists()).toBe(false);
		});

		it("renders custom tooltip text when provided", async () => {
			const itemWithCustomTooltip: AppSidebarItemType = {
				title: "Dashboard",
				url: "/dashboard",
				tooltip: "Navigate to main dashboard",
				icon: Home,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithCustomTooltip, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("tooltip")).toBe("Navigate to main dashboard");
		});

		it("falls back to title for tooltip when custom tooltip is not provided", async () => {
			const itemWithoutCustomTooltip: AppSidebarItemType = {
				title: "User Profile",
				url: "/profile",
				icon: User,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithoutCustomTooltip, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("tooltip")).toBe("User Profile");
		});

		it("handles empty or whitespace tooltip gracefully", async () => {
			const itemWithEmptyTooltip: AppSidebarItemType = {
				title: "Valid Title",
				url: "/valid",
				tooltip: "   ",
				icon: Bot,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithEmptyTooltip, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("tooltip")).toBe("Valid Title");
		});

		it("provides fallback tooltip for items with empty titles", async () => {
			const itemWithEmptyTitle: AppSidebarItemType = {
				title: "",
				url: "/empty-title",
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: itemWithEmptyTitle, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("tooltip")).toBe("Untitled Item");
		});

		it("only shows tooltips for root level items (level 0)", async () => {
			const rootItem: AppSidebarItemType = {
				title: "Root Item",
				url: "/root",
				tooltip: "Root tooltip",
			};

			const nestedItem: AppSidebarItemType = {
				title: "Nested Item",
				url: "/nested",
				tooltip: "Nested tooltip",
			};

			const rootWrapper = mount(AppSidebarItem, {
				props: { item: rootItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const nestedWrapper = mount(AppSidebarItem, {
				props: { item: nestedItem, level: 1 },
				global: {
					plugins: [router],
				},
			});

			// Root level should have tooltip
			const rootMenuButton = rootWrapper.findComponent({
				name: "SidebarMenuButton",
			});
			expect(rootMenuButton.props("tooltip")).toBe("Root tooltip");

			// Nested level should not have tooltip (uses SidebarMenuSubButton)
			const nestedMenuButton = nestedWrapper.findComponent({
				name: "SidebarMenuSubButton",
			});
			expect(nestedMenuButton.exists()).toBe(true);
			expect(nestedMenuButton.props("tooltip")).toBeUndefined();
		});

		it("renders icons in nested items correctly", async () => {
			const nestedItemWithIcon: AppSidebarItemType = {
				title: "Nested with Icon",
				url: "/nested-icon",
				icon: Settings2,
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: nestedItemWithIcon, level: 1 },
				global: {
					plugins: [router],
				},
			});

			const iconComponent = wrapper.findComponent(Settings2);
			expect(iconComponent.exists()).toBe(true);
		});
	});

	describe("Accessibility and ARIA Attributes", () => {
		it("sets proper ARIA attributes for collapsible items", async () => {
			const collapsibleItem: AppSidebarItemType = {
				title: "Collapsible Menu",
				items: [{ title: "Child", url: "/child" }],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: collapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("ariaExpanded")).toBe(false);
			expect(menuButton.props("ariaLabel")).toBe(
				"Collapsible Menu menu, collapsed",
			);
		});

		it("sets proper ARIA attributes for active collapsible items", async () => {
			const activeCollapsibleItem: AppSidebarItemType = {
				title: "Active Menu",
				isActive: true,
				items: [{ title: "Child", url: "/child" }],
			};

			const wrapper = mount(AppSidebarItem, {
				props: { item: activeCollapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const menuButton = wrapper.findComponent({ name: "SidebarMenuButton" });
			expect(menuButton.props("ariaExpanded")).toBe(true);
			expect(menuButton.props("ariaLabel")).toBe("Active Menu menu, expanded");
		});

		it("sets proper role attributes based on item type", async () => {
			const linkItem: AppSidebarItemType = {
				title: "Link Item",
				url: "/link",
			};

			const buttonItem: AppSidebarItemType = {
				title: "Button Item",
			};

			const collapsibleItem: AppSidebarItemType = {
				title: "Collapsible Item",
				items: [{ title: "Child", url: "/child" }],
			};

			const linkWrapper = mount(AppSidebarItem, {
				props: { item: linkItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const buttonWrapper = mount(AppSidebarItem, {
				props: { item: buttonItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			const collapsibleWrapper = mount(AppSidebarItem, {
				props: { item: collapsibleItem, level: 0 },
				global: {
					plugins: [router],
				},
			});

			// Check the computed role attribute from the component
			const linkButton = linkWrapper.findComponent({
				name: "SidebarMenuButton",
			});
			expect(linkButton.attributes("role")).toBe("link");

			// Button item should have button role
			const buttonButton = buttonWrapper.findComponent({
				name: "SidebarMenuButton",
			});
			expect(buttonButton.attributes("role")).toBe("button");

			// Collapsible item should have button role
			const collapsibleButton = collapsibleWrapper.findComponent({
				name: "SidebarMenuButton",
			});
			expect(collapsibleButton.attributes("role")).toBe("button");
		});
	});

	describe("Error Handling and Edge Cases", () => {
		it("handles malformed items gracefully", async () => {
			const malformedItem = {
				title: null,
				url: undefined,
				icon: "invalid-icon",
				items: [null, undefined, { title: "Valid" }],
			} as unknown as AppSidebarItemType;

			expect(() => {
				mount(AppSidebarItem, {
					props: { item: malformedItem, level: 0 },
					global: {
						plugins: [router],
					},
				});
			}).not.toThrow();
		});

		it("handles circular references in nested items", async () => {
			const circularItem: AppSidebarItemType = {
				title: "Circular Parent",
				items: [],
			};

			circularItem.items?.push(circularItem);

			expect(() => {
				mount(AppSidebarItem, {
					props: { item: circularItem, level: 0 },
					global: {
						plugins: [router],
					},
				});
			}).not.toThrow();
		});

		it("handles extremely deep nesting without performance issues", async () => {
			const createDeepItem = (depth: number): AppSidebarItemType => ({
				title: `Level ${depth}`,
				items: depth > 0 ? [createDeepItem(depth - 1)] : undefined,
			});

			const deepItem = createDeepItem(20);

			const startTime = performance.now();
			const wrapper = mount(AppSidebarItem, {
				props: { item: deepItem, level: 0 },
				global: {
					plugins: [router],
				},
			});
			const endTime = performance.now();

			// Should render without excessive delay
			expect(endTime - startTime).toBeLessThan(200);
			expect(wrapper.text()).toContain("Level 20");
			expect(wrapper.text()).toContain("Level 0");
		});
	});
});
