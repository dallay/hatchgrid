import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
			meta: { requiresAuth: true }, // Protected route example
		},
		{
			path: "/login",
			name: "login",
			component: LoginView,
		},
	],
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		const originalPath = to.fullPath;
		try {
			const success = await authStore.checkSession();
			if (success) {
				next();
			} else {
				next({ name: "login", query: { redirect: originalPath } });
			}
		} catch (error) {
			next({ name: "login", query: { redirect: originalPath } });
		}
	} else if (to.name === "login" && authStore.isAuthenticated) {
		// Si ya está autenticado y trata de ir a login, redirige a home
		next({ name: "home" });
	} else {
		next();
	}
});

export default router;
