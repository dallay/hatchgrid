<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import MainMenuNav from "@/components/MainMenuNav.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import UserNav from "@/components/UserNav.vue";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const router = useRouter();
const isLoggingOut = ref(false);

const handleLogout = async () => {
	if (isLoggingOut.value) return;

	isLoggingOut.value = true;
	try {
		await authStore.logoutAsync();
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
  <header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-700"
  >
    <div class="flex items-center gap-2 px-4 flex-1">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="#"> Building Your Application </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <div class="ml-auto flex items-center space-x-4 px-4">
      <MainMenuNav class="mx-6" />
      <ThemeSwitcher />
      <UserNav
        :user="{
          name: 'shadcn',
          email: 'm@example.com',
          avatar: 'https://i.pravatar.cc/300',
        }"
        variant="compact"
      />
    </div>
  </header>
</template>
