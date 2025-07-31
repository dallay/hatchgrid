<!--
  WorkspaceSelectorSkeleton Component

  A loading skeleton component that mimics the structure of the WorkspaceSelector
  while data is being fetched. Provides visual feedback during loading states.

  @example
  <WorkspaceSelectorSkeleton :skeleton-count="5" />
-->
<script setup lang="ts">
import { Building2, ChevronsUpDown } from "lucide-vue-next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  /** Number of skeleton workspace items to show in dropdown */
  skeletonCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  skeletonCount: 3,
});

const { isMobile } = useSidebar();
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            disabled
            class="opacity-75"
          >
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight gap-1">
              <Skeleton class="h-4 w-24 animate-pulse" />
              <Skeleton class="h-3 w-16 animate-pulse" />
            </div>
            <ChevronsUpDown class="ml-auto opacity-50" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>

          <!-- Skeleton items for loading state -->
          <div class="p-2 space-y-2" role="status" aria-label="Loading workspaces">
            <div
              v-for="i in props.skeletonCount"
              :key="`skeleton-workspace-${i}`"
              class="flex items-center gap-2 p-2 rounded-sm"
              :aria-label="`Loading workspace ${i}`"
            >
              <Skeleton class="size-6 rounded-sm animate-pulse" aria-hidden="true" />
              <div class="flex flex-col flex-1 gap-1">
                <Skeleton class="h-4 w-20 animate-pulse" aria-hidden="true" />
                <Skeleton class="h-3 w-16 animate-pulse" aria-hidden="true" />
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
