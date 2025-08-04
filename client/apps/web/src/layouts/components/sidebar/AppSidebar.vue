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
 * - Integration with WorkspaceSelector and UserNav components
 *
 * @component
 */

import { computed, onMounted, ref } from "vue";

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
import WorkspaceSelector from "@/components/WorkspaceSelector.vue";
import { useWorkspaceStoreProvider } from "@/workspace/infrastructure/providers/workspaceStoreProvider";
import type { WorkspaceError } from "@/workspace/infrastructure/store/useWorkspaceStore";

import AppSidebarItem from "./AppSidebarItem.vue";
import { useNavigationFiltering } from "./composables/useNavigationFiltering";
import type {
	AppSidebarItem as AppSidebarItemType,
	AppSidebarProps,
} from "./types";

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

// useWorkspaceStoreProvider() returns a hook factory; () invokes the hook to get the store
const workspaceStore = useWorkspaceStoreProvider()();

// Error state management
const workspaceError = ref<WorkspaceError | null>(null);

// Load workspaces on component mount
onMounted(async () => {
	try {
		workspaceError.value = null;
		await workspaceStore.loadAll();
		// Try to restore persisted workspace selection
		await workspaceStore.restorePersistedWorkspace();
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to load workspaces";
		workspaceError.value = {
			message: errorMessage,
			code: "WORKSPACE_LOAD_ERROR",
			timestamp: new Date(),
		};
		console.error("Failed to load workspaces:", error);
		// Could emit an event or use a toast notification here
	}
});

// Handle workspace selection changes
const handleWorkspaceChange = async (workspaceId: string) => {
	try {
		workspaceError.value = null;
		await workspaceStore.selectWorkspace(workspaceId);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to select workspace";
		workspaceError.value = {
			message: errorMessage,
			code: "WORKSPACE_SELECT_ERROR",
			timestamp: new Date(),
		};
		console.error("Failed to select workspace:", error);
		// Could show user-friendly error message
	}
};
</script>

<template>
  <Sidebar v-bind="sidebarProps">
    <!-- Workspace Selector Header -->
    <SidebarHeader>
      <WorkspaceSelector
        :workspaces="workspaceStore.workspaces"
        :initial-workspace-id="workspaceStore.currentWorkspace?.id"
        :loading="workspaceStore.isLoading"
        :error="workspaceError"
        @workspace-change="handleWorkspaceChange"
      />
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
            <div
              class="flex items-center gap-2 p-2 text-sm text-muted-foreground"
              role="alert"
              aria-live="polite"
            >
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
