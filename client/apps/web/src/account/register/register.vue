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
        <div class="grid gap-2">
          <Label for="firstName">First Name</Label>
          <Input
            id="firstName"
            v-model="form.firstName"
            type="text"
            placeholder="Enter your first name"
            required
            @input="validateField('firstName')"
          />
          <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">
            {{ errors.firstName }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="lastName">Last Name</Label>
          <Input
            id="lastName"
            v-model="form.lastName"
            type="text"
            placeholder="Enter your last name"
            required
            @input="validateField('lastName')"
          />
          <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">
            {{ errors.lastName }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Choose a username"
            required
            @input="validateField('username')"
          />
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">
            {{ errors.username }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            required
            @input="validateField('email')"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Create a password"
            required
            @input="validateField('password')"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            @input="validateField('confirmPassword')"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <Button type="submit" :disabled="isLoading || !formIsValid" class="w-full">
          {{ isLoading ? "Creating Account..." : "Create Account" }}
        </Button>
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
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const form = ref({
	firstName: "",
	lastName: "",
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
});
const errors = ref({
	firstName: "",
	lastName: "",
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
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
				form.value.lastName.length < 2
					? "Last name must be at least 2 characters."
					: "";
			break;
		case "username":
			errors.value.username =
				form.value.username.length < 3
					? "Username must be at least 3 characters."
					: "";
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
				errors.value.password =
					"Password must include at least one uppercase letter.";
			} else if (!LOWERCASE_REGEX.test(password)) {
				errors.value.password =
					"Password must include at least one lowercase letter.";
			} else if (!DIGIT_REGEX.test(password)) {
				errors.value.password = "Password must include at least one number.";
			} else if (!SPECIAL_CHAR_REGEX.test(password)) {
				errors.value.password =
					"Password must include at least one special character.";
			} else {
				errors.value.password = "";
			}
			break;
		}
		case "confirmPassword":
			errors.value.confirmPassword =
				form.value.password !== form.value.confirmPassword
					? "Passwords do not match."
					: "";
			break;
	}
};

const validateForm = () => {
	validateField("firstName");
	validateField("lastName");
	validateField("username");
	validateField("email");
	validateField("password");
	validateField("confirmPassword");
	return Object.values(errors.value).every((msg) => !msg);
};

const formIsValid = computed(() => validateForm());

const handleRegister = async () => {
	if (isLoading.value || !formIsValid.value) return;

	isLoading.value = true;
	try {
		await authStore.register({
			email: form.value.email,
			password: form.value.password,
			firstName: form.value.firstName,
			lastName: form.value.lastName,
			username: form.value.username,
		});

		toast.success("Account created successfully!", {
			description:
				"Welcome to Hatchgrid! Please sign in with your new account.",
		});

		await router.push("/login");
	} catch (error: unknown) {
		if (import.meta.env.DEV) {
			console.error("Registration error:", error);
		}
		const description = "Unable to create your account. Please try again.";
		toast.error("Registration failed", { description });
	} finally {
		isLoading.value = false;
	}
};
</script>
