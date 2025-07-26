<script setup lang="ts">
/**
 * AppSidebar - Main sidebar container component
 *
 * Provides a flexible sidebar navigation system that builds its UI from
 * a declarative configuration structure. Supports:
 * - Dynamic navigation item filtering based on visibility and access control
 * - Async permission evaluation without blocking UI
 * - Integration with existing Sidebar UI components
 * - Loading states and error handling
 * - Props validation with TypeScript
 * - Integration with TeamSwitcher and UserNav components
 *
 * @component
 */

import { Command, GalleryVerticalEnd } from "lucide-vue-next";
import { computed } from "vue";
import TeamSwitcher from "@/components/TeamSwitcher.vue";
import UserNav from "@/components/UserNav.vue";
import type { SidebarProps } from "@/components/ui/sidebar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import AppSidebarItem from "./AppSidebarItem.vue";
import { useNavigationFiltering } from "./composables/useNavigationFiltering.ts";
import type {
	AppSidebarItem as AppSidebarItemType,
	AppSidebarProps,
} from "./types.ts";

// Extend SidebarProps with our custom props
interface Props extends SidebarProps, AppSidebarProps {}

const props = withDefaults(defineProps<Props>(), {
	collapsible: "icon",
	items: () => [],
});

// Use navigation filtering composable
const { filteredItems, shouldShowLoading, shouldShowError } =
	useNavigationFiltering(() => props.items, {
		maxRetries: 3,
		retryDelay: 1000,
		onError: (error, info) => {
			console.error("AppSidebar error:", error, info);
		},
	});

// Generate stable keys for navigation items
const getItemKey = (item: AppSidebarItemType, index: number) => {
	// Use URL as primary key, fallback to title-index combination
	if (item.url) return item.url;
	return `${item.title}-${index}`;
};

// Extract sidebar-specific props to pass to the Sidebar component
const sidebarProps = computed(() => {
	const { items, ...rest } = props;
	return rest;
});

// Sample team data - in a real app, this would come from a store or API
const teams = [
	{
		name: "Hatchgrid",
		logo: Command,
		plan: "Enterprise",
	},
	{
		name: "Acme Inc.",
		logo: GalleryVerticalEnd,
		plan: "Startup",
	},
];
</script>

<template>
  <Sidebar v-bind="sidebarProps">
    <!-- Team Switcher Header -->
    <SidebarHeader>
      <TeamSwitcher :teams="teams" />
    </SidebarHeader>

    <!-- Main Navigation Content -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <!-- Loading state -->
          <template v-if="shouldShowLoading">
            <SidebarMenuSkeleton v-for="i in 3" :key="`skeleton-${i}`" />
          </template>

          <!-- Error state -->
          <template v-else-if="shouldShowError">
            <div class="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <span>Failed to load navigation</span>
            </div>
          </template>

          <!-- Navigation items -->
          <template v-else>
            <AppSidebarItem
              v-for="(item, index) in filteredItems"
              :key="getItemKey(item, index)"
              :item="item"
            />
          </template>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <!-- User Navigation Footer -->
    <SidebarFooter>
      <UserNav variant="full" />
    </SidebarFooter>
  </Sidebar>
</template>
