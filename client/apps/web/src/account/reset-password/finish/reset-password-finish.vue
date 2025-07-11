<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password.</CardDescription>
      </CardHeader>
      <form @submit.prevent="handleResetPassword">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="newPassword">New Password</Label>
            <Input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              required
            />
          </div>
          <p v-if="error" class="text-sm text-red-600" role="alert">
            {{ error }}
          </p>
          <p v-if="success" class="text-sm text-green-600" role="status">
            {{ success }}
          </p>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 mt-4">
          <Button type="submit" class="w-full">Set New Password</Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const route = useRoute();
const router = useRouter();
const newPassword = ref("");
const confirmNewPassword = ref("");
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const resetKey = ref<string | null>(null);

onMounted(() => {
	resetKey.value = route.query.key as string;
	if (!resetKey.value) {
		error.value = "Reset key is missing. Please use the link from your email.";
	}
});

const handleResetPassword = async () => {
	error.value = null;
	success.value = null;

	if (!resetKey.value) {
		error.value = "Reset key is missing.";
		return;
	}

	if (newPassword.value !== confirmNewPassword.value) {
		error.value = "New passwords do not match.";
		return;
	}

	try {
		await axios.post("/api/account/reset-password/finish", {
			key: resetKey.value,
			newPassword: newPassword.value,
		});
		success.value = "Your password has been reset successfully. Please log in.";
		// Optionally redirect to login page after a short delay
		setTimeout(() => {
			router.push("/login");
		}, 3000);
	} catch (err: any) {
		error.value =
			err.response?.data?.detail ||
			"Failed to reset password. The key might be invalid or expired.";
	}
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>