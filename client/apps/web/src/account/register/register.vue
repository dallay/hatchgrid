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
          <label
            for="firstName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            First Name
          </label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            placeholder="Enter your first name"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="validateField('firstName')"
          />
          <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">
            {{ errors.firstName }}
          </p>
        </div>

        <div>
          <label
            for="lastName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Last Name
          </label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            required
            placeholder="Enter your last name"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="validateField('lastName')"
          />
          <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">
            {{ errors.lastName }}
          </p>
        </div>

        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="Choose a username"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="validateField('username')"
          />
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">
            {{ errors.username }}
          </p>
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="validateField('email')"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Create a password"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="validateField('password')"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !formIsValid"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {{ isLoading ? "Creating Account..." : "Create Account" }}
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";

const router = useRouter();
const isLoading = ref(false);
const form = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
});
const errors = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
});

const validateField = (field: string) => {
  switch (field) {
    case "firstName":
      errors.value.firstName =
        form.value.firstName.length < 2
          ? "First name must be at least 2 characters."
          : "";
      break;
    case "lastName":
      errors.value.lastName =
        form.value.lastName.length < 2 ? "Last name must be at least 2 characters." : "";
      break;
    case "username":
      errors.value.username =
        form.value.username.length < 3 ? "Username must be at least 3 characters." : "";
      break;
    case "email":
      errors.value.email = !/^\S+@\S+\.\S+$/.test(form.value.email)
        ? "Please enter a valid email address."
        : "";
      break;
    case "password": {
      const MIN_LENGTH = 8;
      const LENGTH_REGEX = new RegExp(`^.{${MIN_LENGTH},}$`);
      const UPPERCASE_REGEX = /[A-Z]/;
      const LOWERCASE_REGEX = /[a-z]/;
      const DIGIT_REGEX = /\d/;
      const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

      const password = form.value.password;
      if (!LENGTH_REGEX.test(password)) {
        errors.value.password = `Password must be at least ${MIN_LENGTH} characters.`;
      } else if (!UPPERCASE_REGEX.test(password)) {
        errors.value.password = "Password must include at least one uppercase letter.";
      } else if (!LOWERCASE_REGEX.test(password)) {
        errors.value.password = "Password must include at least one lowercase letter.";
      } else if (!DIGIT_REGEX.test(password)) {
        errors.value.password = "Password must include at least one number.";
      } else if (!SPECIAL_CHAR_REGEX.test(password)) {
        errors.value.password = "Password must include at least one special character.";
      } else {
        errors.value.password = "";
      }
      break;
    }
  }
};

const validateForm = () => {
  validateField("firstName");
  validateField("lastName");
  validateField("username");
  validateField("email");
  validateField("password");
  return Object.values(errors.value).every((msg) => !msg);
};

const formIsValid = computed(() => validateForm());

const handleRegister = async () => {
  if (isLoading.value || !formIsValid.value) return;

  isLoading.value = true;
  try {
    await axios.post("/api/register", {
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      username: form.value.username,
    });

    toast.success("Account created successfully!", {
      description: "Welcome to Hatchgrid! Please sign in with your new account.",
    });

    await router.push("/login");
  } catch (error: unknown) {
    console.error("Registration error:", error);
    let description = "Unable to create your account. Please try again.";
    if (axios.isAxiosError(error)) {
      description = error.response?.data?.detail || description;
    }
    toast.error("Registration failed", { description });
  } finally {
    isLoading.value = false;
  }
};
</script>
