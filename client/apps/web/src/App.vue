<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink v-if="!isAuthenticated" to="/login">Login</RouterLink>
      <button v-if="isAuthenticated" @click="handleLogout" :disabled="isLoggingOut">
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </button>
    </nav>
  </header>
  <RouterView />
  <Toaster />
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const router = useRouter();
const isLoggingOut = ref(false);

const handleLogout = async () => {
	if (isLoggingOut.value) return; // Prevent multiple simultaneous logout attempts

	isLoggingOut.value = true;
	try {
		await authStore.logout();
		toast.success("Successfully logged out", {
			description: "You have been securely logged out of your account.",
		});
		router.push("/login");
	} catch (error) {
		console.error("Error during logout:", error);
		toast.error("Logout failed", {
			description:
				"Unable to log you out. Please try again or contact support if the problem persists.",
		});
	} finally {
		isLoggingOut.value = false;
	}
};
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

button {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  background: none;
  border-top: none;
  border-right: none;
  border-bottom: none;
  color: inherit;
  font-size: inherit;
  cursor: pointer;
  text-decoration: none;
}

button:hover:not(:disabled) {
  background-color: var(--color-background-mute);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
