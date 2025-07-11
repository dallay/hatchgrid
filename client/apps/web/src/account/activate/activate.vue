<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-4">Account Activation</h1>
      <div v-if="success" class="text-green-600 mb-4">
        <p>Your account has been successfully activated. Please log in.</p>
        <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link>
      </div>
      <div v-else-if="error" class="text-red-600 mb-4">
        <p>Account activation failed: {{ error }}</p>
        <router-link to="/" class="text-blue-500 hover:underline">Go to Home</router-link>
      </div>
      <div v-else class="text-gray-600">
        <p>Activating your account...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const success = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	const key = route.query.key as string;
	if (!key) {
		error.value = "Activation key is missing.";
		return;
	}

	try {
		await axios.get(`/api/activate?key=${key}`);
		success.value = true;
	} catch (err: any) {
		error.value =
			err.response?.data?.message || "An unexpected error occurred.";
	}
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>