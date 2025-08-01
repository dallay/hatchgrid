<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toaster />
</template>

<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView } from "vue-router";
import Toaster from "./components/ui/sonner/Sonner.vue";
import AppLayout from "./layouts/AppLayout.vue";

// Initialize CSRF token on app mount
onMounted(async () => {
	const MAX_RETRIES = 3;
	const TIMEOUT_MS = 5000;
	let attempt = 0;
	let success = false;

	while (attempt < MAX_RETRIES && !success) {
		attempt++;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
		try {
			await fetch("/api/health-check", {
				method: "GET",
				credentials: "include",
				signal: controller.signal,
			});
			success = true;
			if (import.meta.env.DEV) {
				console.log(`CSRF token initialized successfully (attempt ${attempt})`);
			}
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error(
					`Failed to initialize CSRF token (attempt ${attempt}):`,
					error,
				);
			}
			// Wait briefly before retrying (exponential backoff)
			await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
		} finally {
			clearTimeout(timeoutId);
		}
	}
	if (!success) {
		// Consider fallback handling in production
		if (import.meta.env.DEV) {
			console.error("CSRF token initialization failed after maximum retries.");
		}
	}
});
</script>
