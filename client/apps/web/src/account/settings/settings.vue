<template>
  <div class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Account Settings</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form @submit.prevent="handleUpdateSettings">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="firstName">First Name</Label>
            <Input id="firstName" v-model="form.firstName" type="text" required />
          </div>
          <div class="grid gap-2">
            <Label for="lastName">Last Name</Label>
            <Input id="lastName" v-model="form.lastName" type="text" required />
          </div>
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="form.email" type="email" required />
          </div>
          <div class="grid gap-2">
            <Label>Authorities</Label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="authority in form.authorities"
                :key="authority"
                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {{ authority }}
              </span>
            </div>
          </div>
          <p v-if="error" class="text-sm text-red-600" role="alert">
            {{ error }}
          </p>
          <p v-if="success" class="text-sm text-green-600" role="status">
            {{ success }}
          </p>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 mt-4">
          <Button type="submit" class="w-full">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { inject, onMounted, ref } from "vue";
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
import type { Account } from "@/security/account.model";
import type AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";

const accountService = inject<AccountService>("accountService");
const authStore = useAuthStore();

const form = ref({
	firstName: "",
	lastName: "",
	email: "",
	authorities: [] as string[],
});

const error = ref<string | null>(null);
const success = ref<string | null>(null);

onMounted(async () => {
	if (authStore.account) {
		const account = authStore.account as Account;
		form.value.firstName = account.firstname || "";
		form.value.lastName = account.lastname || "";
		form.value.email = account.email || "";
		form.value.authorities = Array.from(account.authorities);
	} else if (accountService) {
		// Attempt to load account if not already in store
		await accountService.loadAccount();
		if (authStore.account) {
			const account = authStore.account as Account;
			form.value.firstName = account.firstname || "";
			form.value.lastName = account.lastname || "";
			form.value.email = account.email || "";
			form.value.authorities = Array.from(account.authorities);
		}
	}
});

const handleUpdateSettings = async () => {
	error.value = null;
	success.value = null;

	try {
		await axios.post("/api/account", {
			firstName: form.value.firstName,
			lastName: form.value.lastName,
			email: form.value.email,
		});

		// Update the auth store with new data
		if (authStore.account) {
			authStore.setAuthentication({
				...authStore.account,
				firstname: form.value.firstName,
				lastname: form.value.lastName,
				email: form.value.email,
				fullname: [form.value.firstName, form.value.lastName]
					.filter(Boolean)
					.join(" "),
			});
		}

		success.value = "Account settings updated successfully!";
	} catch (err: unknown) {
		if (err instanceof Error) {
			error.value =
				(err as { response?: { data?: { message?: string; detail?: string } } })
					.response?.data?.detail || "Failed to update settings.";
		} else {
			error.value = "An unknown error occurred.";
		}
	}
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
