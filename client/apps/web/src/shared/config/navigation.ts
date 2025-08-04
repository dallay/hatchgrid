/**
 * Navigation Configuration
 *
 * Defines the sidebar navigation structure using the AppSidebarItem format.
 * This configuration supports:
 * - Dynamic visibility based on user authentication and roles
 * - Access control using the auth store
 * - Nested menu structures
 * - Icons from Lucide Vue Next
 */

import { Home, Settings, User, Users } from "lucide-vue-next";
import { Authority } from "@/authentication/domain/models";
import { useAuthStore } from "@/authentication/infrastructure/store";
import type { AppSidebarItem } from "@/layouts/components/sidebar/types";

/**
 * Main navigation configuration
 * This function returns the navigation items based on current user state
 */
export function getNavigationItems(): AppSidebarItem[] {
	const authStore = useAuthStore();

	return [
		{
			title: "Dashboard",
			url: "/",
			icon: Home,
			isActive: true, // Dashboard is typically the default active page
		},
		{
			title: "Audience",
			icon: Users,
			visible: () => authStore.isAuthenticated,
			items: [
				{
					title: "Subscribers",
					url: "/audience/subscribers",
				},
			],
		},
		{
			title: "Account",
			icon: User,
			visible: () => authStore.isAuthenticated,
			items: [
				{
					title: "Settings",
					url: "/account/settings",
				},
				{
					title: "Change Password",
					url: "/account/password",
				},
			],
		},
		{
			title: "Admin",
			icon: Settings,
			visible: () => authStore.hasAuthority(Authority.ADMIN),
			canAccess: () => authStore.hasAuthority(Authority.ADMIN),
			items: [
				{
					title: "User Management",
					url: "/admin/users",
					tooltip: "Manage system users",
				},
				{
					title: "System Settings",
					url: "/admin/settings",
					tooltip: "Configure system settings",
				},
			],
		},
	];
}

/**
 * Alternative navigation configuration for different contexts
 * This could be used for different user roles or application modes
 */
export function getMinimalNavigationItems(): AppSidebarItem[] {
	const authStore = useAuthStore();

	return [
		{
			title: "Home",
			url: "/",
			icon: Home,
		},
		{
			title: "Profile",
			url: "/account/settings",
			icon: User,
			visible: () => authStore.isAuthenticated,
		},
	];
}
