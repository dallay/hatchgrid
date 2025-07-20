<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Create Account
        </h2>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Join Hatchgrid to start building amazing applications
        </p>
      </div>

      <form class="space-y-6" @submit="handleRegister">
        <FormField v-slot="{ componentField }" name="firstName">
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Enter your first name"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="lastName">
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Enter your last name"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Enter your email"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Create a password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirm your password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" :disabled="isLoading" class="w-full">
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
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const { t } = useI18n();

const formSchema = toTypedSchema(
	z
		.object({
			firstName: z
				.string()
				.min(2, { message: t("register.form.validation.firstName-min") }),
			lastName: z
				.string()
				.min(2, { message: t("register.form.validation.lastName-min") }),
			email: z.email({ message: t("register.form.validation.email-invalid") }),
			password: z
				.string()
				.min(8, { message: t("register.form.validation.password-min") })
				.regex(/[A-Z]/, {
					message: t("register.form.validation.password-uppercase"),
				})
				.regex(/[a-z]/, {
					message: t("register.form.validation.password-lowercase"),
				})
				.regex(/\d/, { message: t("register.form.validation.password-number") })
				.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
					message: t("register.form.validation.password-special"),
				}),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t("register.form.validation.password-match"),
			path: ["confirmPassword"],
		}),
);

const { handleSubmit } = useForm({
	validationSchema: formSchema,
});

const handleRegister = handleSubmit(async (values) => {
	if (isLoading.value) return;

	isLoading.value = true;
	try {
		await authStore.register({
			email: values.email,
			password: values.password,
			firstname: values.firstName,
			lastname: values.lastName,
		});

		toast.success("Account created successfully!", {
			description:
				"Welcome to Hatchgrid! Please check your email for verification instructions.",
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
});
</script>
