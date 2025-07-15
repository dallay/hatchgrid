<script setup>
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
import AppHeader from "./components/AppHeader.vue";
import SimpleLayout from "./SimpleLayout.vue";
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
