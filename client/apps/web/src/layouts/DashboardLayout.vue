
<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/layouts/components/AppSidebar.vue";
import { useAuthStore } from "../stores/auth";
import AppHeader from "./components/AppHeader.vue";
import SimpleLayout from "./SimpleLayout.vue";

const authStore = useAuthStore();
const router = useRouter();
const isLoggingOut = ref(false);

const handleLogout = async () => {
	if (isLoggingOut.value) return;

	isLoggingOut.value = true;
	try {
		await authStore.logout();
		toast.success("Successfully logged out");
		router.push("/login");
	} catch (error) {
		console.error("Error during logout:", error);
		toast.error("Logout failed");
	} finally {
		isLoggingOut.value = false;
	}
};
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
    <AppHeader />
   <SimpleLayout>
      <slot />
   </SimpleLayout>
    </SidebarInset>
  </SidebarProvider>
</template>
