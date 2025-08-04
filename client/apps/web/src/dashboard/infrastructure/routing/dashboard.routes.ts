import type { RouteRecordRaw } from "vue-router";

import { Authority } from "@/authentication/domain/models";

// Lazy-loaded components for better performance
const HomeView = () => import("@/dashboard/infrastructure/views/HomeView.vue");
const WorkspaceDashboard = () =>
	import("@/dashboard/infrastructure/views/WorkspaceDashboard.vue");

// Route meta interface for type safety
interface DashboardRouteMeta {
	authorities: Authority[];
	layout: string;
}

// Dashboard route configuration
const dashboardRoutes: RouteRecordRaw[] = [
	{
		path: "/",
		name: "Home",
		component: HomeView,
		meta: {
			authorities: [Authority.USER],
			layout: "DashboardLayout",
		} satisfies DashboardRouteMeta,
	},
	{
		path: "/workspace",
		name: "WorkspaceDashboard",
		component: WorkspaceDashboard,
		meta: {
			authorities: [Authority.USER],
			layout: "DashboardLayout",
		} satisfies DashboardRouteMeta,
	},
];

export default dashboardRoutes;
