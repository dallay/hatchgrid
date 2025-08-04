<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <h1 class="text-3xl font-bold mb-6">Account Activation</h1>

      <!-- Success State -->
      <div v-if="activationState === 'success'" class="space-y-4" role="alert" aria-live="polite">
        <div class="text-green-600 text-lg">
          <p>✓ Your account has been successfully activated!</p>
        </div>
        <router-link
          to="/login"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Login
        </router-link>
      </div>

      <!-- Error State -->
      <div v-else-if="activationState === 'error'" class="space-y-4" role="alert" aria-live="assertive">
        <div class="text-red-600">
          <p class="text-lg mb-2">✗ Account activation failed</p>
          <p class="text-sm text-gray-600">{{ errorMessage }}</p>
        </div>
        <router-link
          to="/"
          class="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Return to Home
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-else class="space-y-4" aria-live="polite">
        <div class="text-gray-600">
          <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Activating your account...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { activateAccount } from "../../../application/activate";
import type { AuthenticationError } from "../../../domain/errors";

type ActivationState = "loading" | "success" | "error";

const route = useRoute();
const activationState = ref<ActivationState>("loading");
const errorMessage = ref<string>("");

onMounted(async () => {
	const activationKey = route.query.key as string;

	if (!activationKey) {
		activationState.value = "error";
		errorMessage.value = "Activation key is missing from the URL.";
		return;
	}

	try {
		await activateAccount(activationKey);
		activationState.value = "success";
	} catch (error) {
		activationState.value = "error";
		errorMessage.value =
			(error as AuthenticationError).message ||
			"Failed to activate account. Please try again or contact support.";
	}
});
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
