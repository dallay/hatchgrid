// filepath: client/apps/web/src/composables/useRouteGuards
import type { Router } from "vue-router";
import { LogoutUseCase } from "@/authentication/application";
import { AccountApi } from "@/authentication/infrastructure/api";
import { AuthenticationService } from "@/authentication/infrastructure/services";
import { useAuthStore } from "@/authentication/infrastructure/store";

/**
 * Sets up maintainable route guards for authentication and authorization.
 * @param router Vue Router instance
 * @param injectedAuthService Optional AuthenticationService instance for testability
 */
export function useRouteGuards(
	router: Router,
	injectedAuthService?: AuthenticationService,
) {
	const authStore = useAuthStore();
	const accountApi = new AccountApi();
	const logoutUseCase = new LogoutUseCase(accountApi);
	const authenticationService =
		injectedAuthService ??
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
