<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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

const username = ref("");
const password = ref("");
const error = ref<string | null>(null);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const validateRedirectPath = (path: string | undefined): string | null => {
  if (
      !path ||
      typeof path !== "string" ||
      !path.startsWith("/") ||
      path.includes("..")
  ) {
    return null;
  }
  return path;
};

const handleLogin = async () => {
  error.value = null;
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
  }
};
</script>
<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">
          {{ t('login.title') }}
        </CardTitle>
        <CardDescription>
          {{ t('login.description') }}
        </CardDescription>
      </CardHeader>
      <form @submit.prevent="handleLogin">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="username">{{ t('login.form.username') }}</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              :placeholder="t('login.form.username-placeholder')"
              required
              autocomplete="username"
              :aria-invalid="error ? 'true' : 'false'"
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">{{ t('login.form.password') }}</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              :placeholder="t('login.form.password-placeholder')"
              required
              autocomplete="current-password"
              :aria-invalid="error ? 'true' : 'false'"
            />
          </div>
          <p v-if="error" id="error-message" class="text-sm text-red-600" role="alert" aria-live="polite">
            {{ error }}
          </p>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 mt-4">
          <Button type="submit" class="w-full">
            {{ t('login.form.submit') }}
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
