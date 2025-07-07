<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toaster />
</template>

<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { Toaster } from "./components/ui/sonner";
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

<style scoped>
/* App-level styles - layouts handle their own styling */
</style>
