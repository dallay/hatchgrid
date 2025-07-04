import { ref } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

// Session validation cache
const sessionValidationCache = ref<{
	timestamp: number;
	isValid: boolean;
	isValidating: boolean;
} | null>(null);

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Loading state for session validation
export const isValidatingSession = ref(false);

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

// Helper function to check if cache is valid
const isCacheValid = (): boolean => {
	if (!sessionValidationCache.value) return false;
	const now = Date.now();
	return now - sessionValidationCache.value.timestamp < CACHE_DURATION;
};

// Helper function to validate session with caching
const validateSessionWithCache = async (
	authStore: ReturnType<typeof useAuthStore>,
): Promise<boolean> => {
	// If we're currently validating, wait for it to complete
	if (sessionValidationCache.value?.isValidating) {
		// Wait for the current validation to complete
		while (sessionValidationCache.value?.isValidating) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		return sessionValidationCache.value?.isValid ?? false;
	}

	// If cache is valid, return cached result
	if (isCacheValid() && sessionValidationCache.value) {
		return sessionValidationCache.value.isValid;
	}

	// Set validating state
	sessionValidationCache.value = {
		timestamp: Date.now(),
		isValid: false,
		isValidating: true,
	};
	isValidatingSession.value = true;

	try {
		await authStore.getAccount();
		const success = authStore.isAuthenticated;

		// Update cache with result
		sessionValidationCache.value = {
			timestamp: Date.now(),
			isValid: success,
			isValidating: false,
		};

		return success;
	} catch (error) {
		// Log authentication failure for monitoring
		console.error("Authentication validation failed:", {
			timestamp: new Date().toISOString(),
			error:
				error instanceof Error
					? {
							name: error.name,
							message: error.message,
							stack: error.stack,
						}
					: error,
			userAgent: navigator.userAgent,
		});

		// Update cache with failure
		sessionValidationCache.value = {
			timestamp: Date.now(),
			isValid: false,
			isValidating: false,
		};

		return false;
	} finally {
		isValidatingSession.value = false;
	}
};

router.beforeEach(async (to, _from, next) => {
	const authStore = useAuthStore();

	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		const originalPath = to.fullPath;
		try {
			const success = await validateSessionWithCache(authStore);
			if (success) {
				next();
			} else {
				next({ name: "login", query: { redirect: originalPath } });
			}
		} catch (error) {
			// Log navigation guard error for monitoring
			console.error("Navigation guard error:", {
				timestamp: new Date().toISOString(),
				route: to.fullPath,
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
							}
						: error,
			});
			next({ name: "login", query: { redirect: originalPath } });
		}
	} else if (to.name === "login" && authStore.isAuthenticated) {
		// If already authenticated and trying to access login, redirect to home
		next({ name: "home" });
	} else {
		next();
	}
});

// Helper function to clear session validation cache
export const clearSessionCache = (): void => {
	sessionValidationCache.value = null;
	isValidatingSession.value = false;
};

export default router;
