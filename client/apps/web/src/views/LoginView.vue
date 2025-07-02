<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          aria-label="Enter your username"
          aria-describedby="username-help error-message"
          :aria-invalid="error ? 'true' : 'false'"
          autocomplete="username"
        />
        <span id="username-help" class="sr-only">Enter your username to log into your account</span>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          aria-label="Enter your password"
          aria-describedby="error-message"
          :aria-invalid="error ? 'true' : 'false'"
          autocomplete="current-password"
        />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" id="error-message" class="error-message" role="alert" aria-live="polite">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const username = ref("");
const password = ref("");
const error = ref<string | null>(null);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// @ts-ignore - function is used in template but TS doesn't detect Vue template usage
const handleLogin = async () => {
  error.value = null;
  try {
    await authStore.login(username.value, password.value);
    const redirectPath = validateRedirectPath(
      typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    ) || "/";
    router.push(redirectPath);
  } catch {
    error.value = "Invalid credentials. Please try again.";
  }
};

// Expose function to suppress TypeScript warning
defineExpose({ handleLogin });

const validateRedirectPath = (path: string | string[] | undefined): string | null => {
  if (Array.isArray(path)) path = path[0];
  // Only allow relative paths that start with '/' and don't contain '..'
  if (!path || typeof path !== 'string' || !path.startsWith('/') || path.includes('..')) {
    return null;
  }
  return path;
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 10px;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
