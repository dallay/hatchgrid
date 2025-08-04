<template>
  <div class="user-profile">
    <div v-if="authStore.authenticated" class="flex items-center gap-4">
      <div class="user-info">
        <h3 class="font-medium">{{ authStore.account?.username }}</h3>
        <p class="text-sm text-gray-500">
          {{ t("profile.authorities") }}: {{ userAuthorities.join(", ") }}
        </p>
      </div>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        :disabled="isLoggingOut"
      >
        {{ t("navigation.logout") }}
      </button>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-500 mb-4">{{ t("auth.notAuthenticated") }}</p>
      <router-link
        to="/login"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        {{ t("navigation.login") }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
// Removed unused AccountService type import
import { useAuthStore } from "@/authentication/infrastructure/store";

// Use i18n for reactive translations
const { t } = useI18n();

// Access stores and services
const authStore = useAuthStore();
// Removed unused accountService injection
const router = useRouter();

// Local reactive state
const isLoggingOut = ref(false);

// Computed properties
const userAuthorities = computed(() => {
	return Array.from(authStore.account?.authorities || []);
});

// Enhanced logout with user feedback, sanitized errors, and null checks
const handleLogout = async () => {
	isLoggingOut.value = true;

	try {
		await authStore.logoutAsync();
		router.push("/");
	} catch {
		// Avoid logging sensitive details
		// Show a generic error message to the user (replace with your notification system)
		// Example: toast.error("Logout failed. Please try again.");
		console.warn("Logout failed");
	} finally {
		isLoggingOut.value = false;
	}
};

// Remove unused hasAuthority function. If needed, move to a composable or use inline in template logic.

// If admin-only content is needed, use hasAuthority directly in template or move to composable for reuse.
</script>

<style scoped>
.user-profile {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .user-profile {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-width: 1px;
    margin: 0.5rem;
    font-size: 0.95rem;
  }
}
</style>
