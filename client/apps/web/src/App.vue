<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toaster />

  <div>
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('home.welcome', { name: 'User' }) }}</p>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('es')">Español</button>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView } from "vue-router";
import Toaster from "./components/ui/sonner/Sonner.vue";
import AppLayout from "./layouts/AppLayout.vue";

const { locale } = useI18n();

const changeLanguage = (lang) => {
	locale.value = lang;
};

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
