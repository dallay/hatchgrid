<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your email to reset your password.</CardDescription>
      </CardHeader>
      <form @submit.prevent="handleResetPasswordInit">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your registered email"
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
          <Button type="submit" class="w-full">Reset Password</Button>
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

const email = ref("");
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const handleResetPasswordInit = async () => {
	error.value = null;
	success.value = null;

	try {
		await axios.post("/api/account/reset-password/init", {
			email: email.value,
		});
		success.value = "Password reset email sent. Please check your inbox.";
		email.value = "";
	} catch (err: any) {
		error.value =
			err.response?.data?.detail ||
			"Failed to send password reset email. Please check your email address.";
	}
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>