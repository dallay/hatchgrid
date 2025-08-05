<script setup lang="ts">
import {
	AlertCircle,
	AlertTriangle,
	Building2,
	ChevronsUpDown,
	RefreshCw,
	Search,
	X,
} from "lucide-vue-next";
import { computed, toRef } from "vue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import type { Workspace } from "@/workspace/domain/models";
import type { WorkspaceError } from "@/workspace/infrastructure/store/useWorkspaceStore";
import { useWorkspaceDisplay } from "./composables/useWorkspaceDisplay";
import { useWorkspaceErrorHandling } from "./composables/useWorkspaceErrorHandling";
import { useWorkspaceSearch } from "./composables/useWorkspaceSearch";
import { useWorkspaceSelection } from "./composables/useWorkspaceSelection";
import WorkspaceSelectorSkeleton from "./WorkspaceSelectorSkeleton.vue";

/**
 * Props interface for WorkspaceSelector component
 */
interface WorkspaceSelectorProps {
	/** Array of available workspaces to display */
	workspaces: readonly Workspace[];
	/** Optional initially selected workspace ID */
	initialWorkspaceId?: string;
	/** Loading state indicator */
	loading?: boolean;
	/** Error state for display and handling */
	error?: WorkspaceError | null;
	/** Optional retry function for error recovery */
	onRetry?: () => Promise<void> | void;
	/** Whether to enable search functionality */
	enableSearch?: boolean;
	/** Minimum number of workspaces required to show search */
	searchThreshold?: number;
	/** Whether the selector is disabled */
	disabled?: boolean;
}

/**
 * Events emitted by WorkspaceSelector component
 */
type WorkspaceSelectorEmits = {
	/** Emitted when user selects a different workspace */
	"workspace-change": [workspaceId: string];
	/** Emitted when user clicks retry button */
	retry: [];
};

const props = withDefaults(defineProps<WorkspaceSelectorProps>(), {
	loading: false,
	error: null,
	enableSearch: true,
	searchThreshold: 5,
});

const emit = defineEmits<WorkspaceSelectorEmits>();

const { isMobile } = useSidebar();

// Error handling composable
const {
	hasError,
	isRetryable,
	getErrorTitle,
	getErrorDescription,
	handleError,
	handleRetry: baseHandleRetry,
	showSuccessToast,
	showErrorToast,
} = useWorkspaceErrorHandling({
	error: toRef(props, "error"),
	onRetry: props.onRetry,
});

// Enhanced retry handler that emits retry event
const handleRetry = async () => {
	emit("retry");
	await baseHandleRetry();
};

// Search functionality with debouncing
const {
	searchQuery,
	debouncedSearchQuery,
	isSearching,
	filteredWorkspaces,
	hasSearchQuery,
	showNoResults,
	searchStats,
	setSearchQuery,
	clearSearch,
} = useWorkspaceSearch({
	workspaces: toRef(props, "workspaces"),
	searchDelay: 300,
	minSearchLength: 2,
});

// Enhanced workspace selection with error handling
const {
	activeWorkspace,
	hasWorkspaces,
	selectWorkspace: baseSelectWorkspace,
} = useWorkspaceSelection({
	workspaces: filteredWorkspaces, // Use filtered workspaces
	initialWorkspaceId: toRef(props, "initialWorkspaceId"),
	onWorkspaceChange: (workspaceId: string) =>
		emit("workspace-change", workspaceId),
});

// Enhanced display logic with error states and search
const {
	displayText,
	displaySubtext,
	showEmptyState,
	showLoadingState,
	isWorkspaceActive,
} = useWorkspaceDisplay({
	activeWorkspace,
	loading: toRef(props, "loading"),
	hasWorkspaces,
	isSearching,
	searchQuery: debouncedSearchQuery,
});

// Computed properties for optimization
const shouldShowSearch = computed(
	() => props.enableSearch && props.workspaces.length >= props.searchThreshold,
);

const workspacesToDisplay = computed(() =>
	shouldShowSearch.value ? filteredWorkspaces.value : props.workspaces,
);

const isDisabledOptimized = computed(
	() =>
		props.loading ||
		(workspacesToDisplay.value.length === 0 && !hasError.value),
);

// Enhanced select workspace with error handling and toast notifications
const selectWorkspace = (workspace: Workspace) => {
	try {
		const success = baseSelectWorkspace(workspace);
		if (success) {
			showSuccessToast(
				`Switched to ${workspace.name}`,
				workspace.description || "Workspace selected successfully",
			);
		}
	} catch (error) {
		handleError(error, "workspace selection");
		showErrorToast(
			"Failed to switch workspace",
			error instanceof Error ? error.message : undefined,
		);
	}
};
</script>

<template>
  <!-- Show skeleton loading state -->
  <WorkspaceSelectorSkeleton v-if="showLoadingState && !hasError" />

  <!-- Show main selector -->
  <SidebarMenu v-else data-testid="workspace-selector">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child :disabled="props.disabled">
          <SidebarMenuButton
            size="lg"
            :disabled="isDisabledOptimized || props.disabled"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            :class="{
              'border-destructive/50 bg-destructive/10': hasError,
              'opacity-50 cursor-not-allowed': isDisabledOptimized || props.disabled,
            }"
            data-testid="workspace-selector-trigger"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              :class="{ 'bg-destructive': hasError }"
            >
              <AlertTriangle v-if="hasError" class="size-4" />
              <AlertCircle v-else-if="showEmptyState" class="size-4" />
              <Building2 v-else class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span
                class="truncate font-medium"
                :class="{ 'text-destructive': hasError }"
                data-testid="workspace-display-text"
              >
                {{ hasError ? "Error loading workspaces" : displayText }}
              </span>
              <span class="truncate text-xs" :class="{ 'text-destructive/70': hasError }">
                {{ hasError ? "Click to retry" : displaySubtext }}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
          data-testid="workspace-dropdown"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Workspaces
            <span v-if="shouldShowSearch && searchStats.isFiltered" class="ml-1 text-xs">
              ({{ searchStats.filteredCount }}/{{ searchStats.totalWorkspaces }})
            </span>
          </DropdownMenuLabel>

          <!-- Search input -->
          <div v-if="shouldShowSearch" class="p-2 border-b">
            <div class="relative">
              <Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                :model-value="searchQuery"
                @update:model-value="(value) => setSearchQuery(String(value))"
                placeholder="Search workspaces..."
                class="pl-8 pr-8 h-8 text-sm"
              />
              <Button
                v-if="hasSearchQuery"
                @click="clearSearch"
                variant="ghost"
                size="sm"
                class="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
              >
                <X class="size-3" />
              </Button>
            </div>
          </div>

          <!-- Show error state -->
          <div v-if="hasError" class="p-2" data-testid="workspace-error">
            <Alert variant="destructive" class="mb-2">
              <AlertTriangle class="size-4" />
              <AlertDescription>
                <div class="font-medium">{{ getErrorTitle() }}</div>
                <div class="text-sm mt-1">{{ getErrorDescription() }}</div>
              </AlertDescription>
            </Alert>
            <button
              v-if="isRetryable && onRetry"
              @click="handleRetry"
              class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              data-testid="workspace-retry-button"
            >
              <RefreshCw class="size-3" />
              Try Again
            </button>
            <p v-else class="text-xs text-muted-foreground">
              Please contact support if the problem persists.
            </p>
          </div>

          <!-- Show loading state -->
          <div
            v-else-if="loading"
            class="p-2 text-sm text-muted-foreground"
            data-testid="workspace-loading"
          >
            <div class="flex items-center gap-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
              ></div>
              <span>Loading workspaces...</span>
            </div>
          </div>

          <!-- Show searching state -->
          <div v-else-if="isSearching" class="p-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
              ></div>
              <span>Searching...</span>
            </div>
          </div>

          <!-- Show no search results -->
          <div v-else-if="showNoResults" class="p-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Search class="size-4" />
              <span>No workspaces found</span>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms.
            </p>
          </div>

          <!-- Show empty state -->
          <div
            v-else-if="workspacesToDisplay.length === 0"
            class="p-2"
            data-testid="workspace-empty-state"
          >
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle class="size-4" />
              <span>No workspaces available</span>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">
              Contact your administrator to get access to a workspace.
            </p>
          </div>

          <!-- Show workspace list -->
          <template v-else>
            <DropdownMenuItem
              v-for="workspace in workspacesToDisplay"
              :key="workspace.id"
              class="gap-2 p-2"
              :class="{ 'bg-accent': isWorkspaceActive(workspace) }"
              :data-testid="'workspace-item-' + workspace.id"
              @click="selectWorkspace(workspace)"
            >
              <div class="flex size-6 items-center justify-center rounded-sm border">
                <Building2 class="size-3.5 shrink-0" />
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="truncate font-medium">{{ workspace.name }}</span>
                <span
                  v-if="workspace.description"
                  class="truncate text-xs text-muted-foreground"
                >
                  {{ workspace.description }}
                </span>
              </div>
              <!-- Active indicator -->
              <div
                v-if="isWorkspaceActive(workspace)"
                class="size-2 rounded-full bg-primary"
              />
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
