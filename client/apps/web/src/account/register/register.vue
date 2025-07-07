<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Join Hatchgrid to start building amazing applications
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Enter your full name"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Create a password"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <RouterLink to="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";

const router = useRouter();
const isLoading = ref(false);
const form = ref({
	name: "",
	email: "",
	password: "",
});

const handleRegister = async () => {
	if (isLoading.value) return;

	isLoading.value = true;
	try {
		// Simulate registration API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast.success("Account created successfully!", {
			description:
				"Welcome to Hatchgrid! Please sign in with your new account.",
		});

		router.push("/login");
	} catch (error) {
		console.error("Registration error:", error);
		toast.error("Registration failed", {
			description: "Unable to create your account. Please try again.",
		});
	} finally {
		isLoading.value = false;
	}
};
</script>
