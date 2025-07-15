import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";
import { allowedRoutes } from "./allowedRoutes";

const username = ref("");
const password = ref("");
const error = ref<string | null>(null);
const isLoading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const validateRedirectPath = (path: string | undefined): string | null => {
	const suspiciousPatterns = [
		/%2e/i, // encoded dot
		/%2f/i, // encoded slash
		/%5c/i, // encoded backslash
		/\\/, // literal backslash
		/\/\//, // double slash
		/\.\./, // double dot
	];
	if (
		!path ||
		typeof path !== "string" ||
		!path.startsWith("/") ||
		suspiciousPatterns.some((pat) => pat.test(path)) ||
		!allowedRoutes.some(
			(route) => path === route || path.startsWith(route + "/"),
		)
	) {
		return null;
	}
	return path;
};

const handleLogin = async () => {
	if (isLoading.value) return; // Prevent multiple submissions
	error.value = null;
	isLoading.value = true;
	try {
		await authStore.login(username.value, password.value);
		const redirectQuery =
			typeof route.query.redirect === "string"
				? route.query.redirect
				: undefined;
		const redirectPath = validateRedirectPath(redirectQuery) || "/";
		await router.push(redirectPath);
	} catch {
		error.value = "Invalid credentials. Please try again.";
	} finally {
		isLoading.value = false;
	}
};
