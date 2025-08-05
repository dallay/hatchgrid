import { createRouter as createVueRouter, createWebHistory } from "vue-router";

const ErrorPage = () => import("@/error/Error.vue");

import authRoutes from "@/authentication/infrastructure/routing/auth.routes";
import dashboardRoutes from "@/dashboard/infrastructure/routing/dashboard.routes";
import audience from "@/router/audience";
import { loadLayoutMiddleware } from "./middleware/loadLayoutMiddleware";

export const createRouter = () =>
	createVueRouter({
		history: createWebHistory(),
		routes: [
			...dashboardRoutes,
			{
				path: "/forbidden",
				name: "Forbidden",
				component: ErrorPage,
				meta: { error403: true },
			},
			{
				path: "/not-found",
				name: "NotFound",
				component: ErrorPage,
				meta: { error404: true },
			},
			...authRoutes,
			...audience,
		],
	});

const router = createRouter();

// Add layout middleware to load layout components dynamically
router.beforeEach(loadLayoutMiddleware);

router.beforeResolve(async (to, _from, next) => {
	if (!to.matched.length) {
		next({ path: "/not-found" });
		return;
	}
	next();
});

export default router;
