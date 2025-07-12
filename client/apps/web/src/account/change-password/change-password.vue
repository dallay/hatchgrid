<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Change Password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <form @submit.prevent="handleChangePassword">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              required
            />
          </div>
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
          <Button type="submit" class="w-full">Change Password</Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
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

const currentPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const handleChangePassword = async () => {
	error.value = null;
	success.value = null;

	if (newPassword.value !== confirmNewPassword.value) {
		error.value = "New passwords do not match.";
		return;
	}

	try {
		await axios.post("/api/account/change-password", {
			currentPassword: currentPassword.value,
			newPassword: newPassword.value,
		});
		success.value = "Password changed successfully!";
		currentPassword.value = "";
		newPassword.value = "";
		confirmNewPassword.value = "";
	} catch (err: unknown) {
		if (err instanceof Error) {
			error.value =
				(err as { response?: { data?: { message?: string } } }).response?.data
					?.message || "Failed to change password.";
		} else {
			error.value = "An unknown error occurred.";
		}
	}
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>