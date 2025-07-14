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
	try {
		await fetch("/api/health-check", {
			method: "GET",
			credentials: "include",
		});
		console.log("CSRF token initialized successfully");
	} catch (error) {
		console.error("Failed to initialize CSRF token:", error);
	}
});
</script>
