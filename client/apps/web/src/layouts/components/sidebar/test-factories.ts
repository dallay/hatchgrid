/**
 * Test factories for sidebar components
 * Reduces duplication and improves test maintainability
 */

import { Home, Settings2, User } from "lucide-vue-next";
import type { AppSidebarItem } from "./types";

export const createMockSidebarItem = (
	overrides: Partial<AppSidebarItem> = {},
): AppSidebarItem => ({
	title: "Mock Item",
	url: "/mock",
	icon: Home,
	isActive: false,
	tooltip: "Mock tooltip",
	visible: true,
	...overrides,
});

export const createNestedNavigation = (): AppSidebarItem[] => [
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
];

export const createAsyncPermissionItem = (
	shouldPass = true,
	delay = 10,
): AppSidebarItem => ({
	title: "Async Item",
	url: "/async",
	canAccess: async () => {
		await new Promise((resolve) => setTimeout(resolve, delay));
		return shouldPass;
	},
});

export const createLargeNavigation = (count = 50): AppSidebarItem[] =>
	Array.from({ length: count }, (_, i) => ({
		title: `Item ${i + 1}`,
		url: `/item${i + 1}`,
		icon: i % 2 === 0 ? Home : Settings2,
	}));
