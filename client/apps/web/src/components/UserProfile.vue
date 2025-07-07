<template>
  <div class="user-profile">
    <div v-if="authStore.authenticated" class="flex items-center gap-4">
      <div class="user-info">
        <h3 class="font-medium">{{ authStore.account?.login }}</h3>
        <p class="text-sm text-gray-500">
          {{ t('profile.authorities') }}: {{ userAuthorities.join(', ') }}
        </p>
      </div>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        :disabled="isLoggingOut"
      >
        {{ t('navigation.logout') }}
      </button>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-500 mb-4">{{ t('auth.notAuthenticated') }}</p>
      <router-link
        to="/login"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        {{ t('navigation.login') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";

// Use i18n for reactive translations
const { t } = useI18n();

// Access stores and services
const authStore = useAuthStore();
const accountService = inject<AccountService>("accountService");
const router = useRouter();

// Local reactive state
const isLoggingOut = ref(false);

// Computed properties
const userAuthorities = computed(() => {
	return authStore.account?.authorities || [];
});

// Handle logout
const handleLogout = async () => {
	if (!accountService) {
		console.error("Account service not available");
		return;
	}

	isLoggingOut.value = true;

	try {
		// Call logout method from auth store (which will be implemented)
		await authStore.logoutAsync();

		// Navigate to home page
		router.push("/");
	} catch (error) {
		console.error("Logout failed:", error);
	} finally {
		isLoggingOut.value = false;
	}
};

// Check user authorities
const hasAuthority = async (authority: string): Promise<boolean> => {
	if (!accountService) return false;
	return await accountService.hasAnyAuthorityAndCheckAuth([authority]);
};

// Example of using authority checking
const canAccessAdmin = ref(false);
onMounted(async () => {
	canAccessAdmin.value = await hasAuthority("ROLE_ADMIN");
});
</script>

<style scoped>
.user-profile {
  @apply p-4 border border-gray-200 rounded-lg;
}
</style>
