<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useAuthStore } from "@/authentication/infrastructure/store";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { allowedRoutes } from "./allowedRoutes";

const error = ref<string | null>(null);
const isLoading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const formSchema = toTypedSchema(
	z.object({
		username: z
			.string()
			.trim()
			.min(1, { message: t("login.form.validation.username-required") }),
		password: z
			.string()
			.min(1, { message: t("login.form.validation.password-required") }),
	}),
);

const { handleSubmit } = useForm({
	validationSchema: formSchema,
});

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
			(route) => path === route || path.startsWith(`${route}/`),
		)
	) {
		return null;
	}
	return path;
};

const handleLogin = handleSubmit(async (values) => {
	if (isLoading.value) return; // Prevent multiple submissions
	error.value = null;
	isLoading.value = true;
	try {
		await authStore.login(values.username, values.password);
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
});
</script>
<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">
          {{ t("login.title") }}
        </CardTitle>
        <CardDescription>
          {{ t("login.description") }}
        </CardDescription>
      </CardHeader>
      <form @submit.prevent="handleLogin">
        <CardContent class="grid gap-4">
          <FormField v-slot="{ componentField }" name="username">
            <FormItem>
              <FormLabel>{{ t("login.form.username") }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  :placeholder="t('login.form.username-placeholder')"
                  v-bind="componentField"
                  autocomplete="username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>{{ t("login.form.password") }}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  :placeholder="t('login.form.password-placeholder')"
                  v-bind="componentField"
                  autocomplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <p
            v-if="error"
            id="error-message"
            class="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {{ error }}
          </p>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 mt-4">
          <Button type="submit" class="w-full" :disabled="isLoading">
            <span v-if="!isLoading">{{ t("login.form.submit") }}</span>
            <span v-else>
              <svg
                class="animate-spin h-4 w-4 mr-2 inline-block"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              {{ t("login.form.loading") }}
            </span>
          </Button>
          <div class="mt-4 text-center text-sm">
            {{ t("login.form.register") }}
            <router-link to="/register" class="underline">
              {{ t("login.form.register-link") }}
            </router-link>
          </div>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
