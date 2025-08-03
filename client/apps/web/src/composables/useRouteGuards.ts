// filepath: client/apps/web/src/composables/useRouteGuards
import type { Router } from "vue-router";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";

/**
 * Sets up maintainable route guards for authentication and authorization.
 * @param router Vue Router instance
 * @param injectedAccountService Optional AccountService instance for testability
 */
export function useRouteGuards(
	router: Router,
	injectedAccountService?: AccountService,
) {
	const authStore = useAuthStore();
	const accountService =
		injectedAccountService ?? new AccountService(authStore, router);
	const publicPages = ["/login", "/register"];

	router.beforeResolve(async (to, _from, next) => {
		if (publicPages.includes(to.path)) {
			next();
			return;
		}

		if (!authStore.authenticated) {
			try {
				await accountService.update();
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
				await accountService.hasAnyAuthorityAndCheckAuth(to.meta.authorities);
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
