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
import { i18n } from "@/i18n";
import type { AppSidebarItem } from "@/layouts/components/sidebar/types";

/**
 * Main navigation configuration
 * This function returns the navigation items based on current user state
 */
export function getNavigationItems(): AppSidebarItem[] {
	const authStore = useAuthStore();
	const t = (k: string) => i18n.global.t(k) as string;

	return [
		{
			title: t("global.navigation.dashboard"),
			url: "/",
			icon: Home,
			isActive: true, // Dashboard is typically the default active page
		},
		{
			title: t("global.navigation.audience"),
			icon: Users,
			visible: () => authStore.isAuthenticated,
			items: [
				{
					title: t("global.navigation.subscribers"),
					url: "/audience/subscribers",
				},
				{
					title: t("global.navigation.tags"),
					url: "/audience/tags",
				},
			],
		},
		{
			title: t("global.navigation.account"),
			icon: User,
			visible: () => authStore.isAuthenticated,
			items: [
				{
					title: t("global.navigation.settings"),
					url: "/account/settings",
				},
				{
					title: t("global.navigation.changePassword"),
					url: "/account/password",
				},
			],
		},
		{
			title: t("global.navigation.admin"),
			icon: Settings,
			visible: () => authStore.hasAuthority(Authority.ADMIN),
			canAccess: () => authStore.hasAuthority(Authority.ADMIN),
			items: [
				{
					title: t("global.navigation.userManagement"),
					url: "/admin/users",
					tooltip: t("global.navigation.userManagementTooltip"),
				},
				{
					title: t("global.navigation.systemSettings"),
					url: "/admin/settings",
					tooltip: t("global.navigation.systemSettingsTooltip"),
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
	const t = (k: string) => i18n.global.t(k) as string;

	return [
		{
			title: t("global.navigation.home"),
			url: "/",
			icon: Home,
		},
		{
			title: t("global.navigation.profile"),
			url: "/account/settings",
			icon: User,
			visible: () => authStore.isAuthenticated,
		},
	];
}
