<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink v-if="!authStore.isAuthenticated" to="/login">Login</RouterLink>
      <button v-if="authStore.isAuthenticated" @click="handleLogout">Logout</button>
    </nav>
  </header>
  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
	try {
		await authStore.logout();
		router.push("/login");
		// Consider adding success notification/toast
	} catch (error) {
		console.error("Error during logout:", error);
		// Consider showing user-friendly error message
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
</style>
