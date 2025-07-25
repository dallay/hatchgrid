import {
	BookOpen,
	Bot,
	Frame,
	Map as MapIcon,
	PieChart,
	Settings2,
	SquareTerminal,
} from "lucide-vue-next";
import type { AppSidebarItem } from "./types";

/**
 * Example navigation items for development and testing
 * Demonstrates various features like nested menus, icons, and conditional visibility
 */
export const exampleNavItems: AppSidebarItem[] = [
	{
		title: "Playground",
		url: "/playground",
		icon: SquareTerminal,
		isActive: true,
		items: [
			{
				title: "History",
				url: "/playground/history",
			},
			{
				title: "Starred",
				url: "/playground/starred",
			},
			{
				title: "Settings",
				url: "/playground/settings",
			},
		],
	},
	{
		title: "Models",
		url: "/models",
		icon: Bot,
		items: [
			{
				title: "Genesis",
				url: "/models/genesis",
			},
			{
				title: "Explorer",
				url: "/models/explorer",
			},
			{
				title: "Quantum",
				url: "/models/quantum",
			},
		],
	},
	{
		title: "Documentation",
		url: "/docs",
		icon: BookOpen,
		items: [
			{
				title: "Introduction",
				url: "/docs/introduction",
			},
			{
				title: "Get Started",
				url: "/docs/get-started",
			},
			{
				title: "Tutorials",
				url: "/docs/tutorials",
			},
			{
				title: "Changelog",
				url: "/docs/changelog",
			},
		],
	},
	{
		title: "Projects",
		icon: Frame,
		items: [
			{
				title: "Design Engineering",
				url: "/projects/design",
				icon: Frame,
			},
			{
				title: "Sales & Marketing",
				url: "/projects/sales",
				icon: PieChart,
			},
			{
				title: "Travel",
				url: "/projects/travel",
				icon: MapIcon,
			},
		],
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings2,
		items: [
			{
				title: "General",
				url: "/settings/general",
			},
			{
				title: "Team",
				url: "/settings/team",
			},
			{
				title: "Billing",
				url: "/settings/billing",
			},
			{
				title: "Limits",
				url: "/settings/limits",
			},
		],
	},
];

/**
 * Example with conditional visibility and access control
 */
export const exampleConditionalNavItems: AppSidebarItem[] = [
	{
		title: "Public Dashboard",
		url: "/dashboard",
		icon: SquareTerminal,
	},
	{
		title: "Admin Panel",
		url: "/admin",
		icon: Settings2,
		visible: () => {
			// Example: Check if user is admin
			return localStorage.getItem("userRole") === "admin";
		},
		canAccess: async () => {
			// Example: Async permission check
			try {
				const response = await fetch("/api/user/permissions");
				const permissions = await response.json();
				return permissions.includes("admin.access");
			} catch {
				return false;
			}
		},
		items: [
			{
				title: "Users",
				url: "/admin/users",
			},
			{
				title: "System Settings",
				url: "/admin/system",
			},
		],
	},
	{
		title: "Beta Features",
		icon: Bot,
		visible: () => {
			// Example: Feature flag check
			return localStorage.getItem("betaFeatures") === "enabled";
		},
		items: [
			{
				title: "AI Assistant",
				url: "/beta/ai",
			},
			{
				title: "Advanced Analytics",
				url: "/beta/analytics",
			},
		],
	},
];
