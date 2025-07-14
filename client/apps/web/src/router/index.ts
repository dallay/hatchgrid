import { createRouter as createVueRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const ErrorPage = () => import("@/error/error.vue");

import account from "@/router/account";
import { Authority } from "@/security/authority";
import { loadLayoutMiddleware } from "./middleware/loadLayoutMiddleware";

export const createRouter = () =>
	createVueRouter({
		history: createWebHistory(),
		routes: [
			{
				path: "/",
				name: "Home",
				component: HomeView,
				meta: { authorities: [Authority.USER], layout: "DashboardLayout" },
			},
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
			...account,
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
