import type { Router } from "vue-router";
import { LogoutUseCase } from "@/authentication/application";
import { AccountApi } from "@/authentication/infrastructure/api";
import { AuthenticationService } from "@/authentication/infrastructure/services";
import { useAuthStore } from "@/authentication/infrastructure/store";

/**
 * Sets up route guards for a Vue Router instance to handle authentication and authorization.
 *
 * @param {Router} router - The Vue Router instance to which the guards will be applied.
 * @param {AuthenticationService} [authService] - Optional custom authentication service.
 * If not provided, a default instance will be created.
 *
 * @remarks
 * - Redirects unauthenticated users to the login page.
 * - Checks if the user has the required authorities for protected routes.
 * - Handles public pages without authentication checks.
 * - Updates the authentication state before resolving routes.
 *
 * @example
 * ```typescript
 * import { createRouter, createWebHistory } from "vue-router";
 * import { useRouteGuards } from "@/composables/useRouteGuards";
 *
 * const router = createRouter({
 *   history: createWebHistory(),
 *   routes: [
 *     { path: "/login", component: LoginPage },
 *     { path: "/dashboard", component: DashboardPage, meta: { authorities: ["ADMIN"] } },
 *   ],
 * });
 *
 * useRouteGuards(router);
 */
export function useRouteGuards(
	router: Router,
	authService?: AuthenticationService,
) {
	const authStore = useAuthStore();
	const accountApi = new AccountApi();
	const logoutUseCase = new LogoutUseCase(accountApi);
	const authenticationService =
		authService ??
		new AuthenticationService(authStore, accountApi, logoutUseCase, router);
	const publicPages = ["/login", "/register"];

	router.beforeResolve(async (to, _from, next) => {
		if (publicPages.includes(to.path)) {
			next();
			return;
		}

		if (!authStore.authenticated) {
			try {
				await authenticationService.update();
			} catch (_error) {
				next({ path: "/login", query: { redirect: to.fullPath } });
				return;
			}
		}

		if (
			to.meta?.authorities &&
			Array.isArray(to.meta.authorities) &&
			to.meta.authorities.length > 0
		) {
			const hasRequiredAuthority =
				await authenticationService.hasAnyAuthorityAndCheckAuth(
					to.meta.authorities,
				);
			if (!hasRequiredAuthority) {
				if (authStore.authenticated) {
					next({ path: "/forbidden" });
				} else {
					next({ path: "/login", query: { redirect: to.fullPath } });
				}
				return;
			}
		}
		next();
	});
}
