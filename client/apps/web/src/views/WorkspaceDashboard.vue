<script setup lang="ts">
/**
 * WorkspaceDashboard - Example view demonstrating workspace functionality
 *
 * This component serves as an example of how to use the workspace module
 * in a real application view. It demonstrates:
 * - Workspace loading lifecycle management
 * - Proper loading states and error handling
 * - Empty state handling when no workspace is loaded
 * - Reactive workspace data display
 */

import { AlertCircle, Building2, Calendar, User } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceStoreProvider } from "@/workspace/providers/workspaceStoreProvider";

// Get workspace store instance
const workspaceStore = useWorkspaceStoreProvider()();

// Local loading state for initial load
const isInitialLoading = ref(true);
const initializationError = ref<string | null>(null);

// Computed properties for reactive data
const currentWorkspace = computed(() => workspaceStore.currentWorkspace);
const hasWorkspace = computed(() => currentWorkspace.value !== null);
const isLoading = computed(
	() => isInitialLoading.value || workspaceStore.isLoading,
);
const hasError = computed(
	() => initializationError.value !== null || workspaceStore.hasError,
);
const errorMessage = computed(
	() =>
		initializationError.value ||
		workspaceStore.error?.message ||
		"An unknown error occurred",
);

// Format dates for display
const formatDate = (dateString: string): string => {
	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
};

// Initialize workspace data on component mount
onMounted(async () => {
	try {
		isInitialLoading.value = true;
		initializationError.value = null;

		// Load all workspaces first
		await workspaceStore.loadAll();

		// Try to restore persisted workspace selection
		const restored = await workspaceStore.restorePersistedWorkspace();

		// If no workspace was restored and we have workspaces available,
		// select the first one as default
		if (!restored && workspaceStore.workspaces.length > 0) {
			await workspaceStore.selectWorkspace(workspaceStore.workspaces[0].id);
		}
	} catch (error) {
		console.error("Failed to initialize workspace dashboard:", error);
		initializationError.value =
			error instanceof Error ? error.message : "Failed to load workspace data";
	} finally {
		isInitialLoading.value = false;
	}
});

// Handle retry action
const handleRetry = async () => {
	initializationError.value = null;
	workspaceStore.clearError();

	try {
		await workspaceStore.loadAll(true); // Force refresh
	} catch (error) {
		console.error("Retry failed:", error);
		initializationError.value =
			error instanceof Error ? error.message : "Retry failed";
	}
};

// Handle workspace selection (for demo purposes)
const handleSelectWorkspace = async (workspaceId: string) => {
	try {
		await workspaceStore.selectWorkspace(workspaceId);
	} catch (error) {
		console.error("Failed to select workspace:", error);
	}
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-2">
      <Building2 class="h-6 w-6" />
      <h1 class="text-2xl font-bold">Workspace Dashboard</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-4 w-32" />
        </CardHeader>
        <CardContent class="space-y-3">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Alert v-else-if="hasError" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error Loading Workspace</AlertTitle>
      <AlertDescription class="mt-2">
        {{ errorMessage }}
        <Button
          variant="outline"
          size="sm"
          class="mt-2"
          @click="handleRetry"
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Empty State - No Workspace Selected -->
    <div v-else-if="!hasWorkspace" class="text-center py-12">
      <Building2 class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h2 class="text-xl font-semibold mb-2">No Workspace Selected</h2>
      <p class="text-muted-foreground mb-4">
        Please select a workspace from the sidebar to view dashboard information.
      </p>

      <!-- Show available workspaces if any -->
      <div v-if="workspaceStore.workspaces.length > 0" class="mt-6">
        <p class="text-sm text-muted-foreground mb-3">Available workspaces:</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <Button
            v-for="workspace in workspaceStore.workspaces"
            :key="workspace.id"
            variant="outline"
            size="sm"
            @click="handleSelectWorkspace(workspace.id)"
          >
            {{ workspace.name }}
          </Button>
        </div>
      </div>

      <!-- No workspaces available -->
      <Alert v-else class="mt-6 max-w-md mx-auto">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>No Workspaces Available</AlertTitle>
        <AlertDescription>
          Contact your administrator to get access to a workspace.
        </AlertDescription>
      </Alert>
    </div>

    <!-- Workspace Information Display -->
    <div v-else class="space-y-6">
      <!-- Current Workspace Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Building2 class="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{{ currentWorkspace?.name }}</CardTitle>
              <CardDescription v-if="currentWorkspace?.description">
                {{ currentWorkspace.description }}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Workspace Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-2 text-sm">
              <User class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Owner ID:</span>
              <span class="font-mono text-xs">{{ currentWorkspace?.ownerId }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Created:</span>
              <span>{{ currentWorkspace ? formatDate(currentWorkspace.createdAt) : '' }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Updated:</span>
              <span>{{ currentWorkspace ? formatDate(currentWorkspace.updatedAt) : '' }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <Building2 class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Workspace ID:</span>
              <span class="font-mono text-xs">{{ currentWorkspace?.id }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Workspace Statistics Card -->
      <Card>
        <CardHeader>
          <CardTitle>Workspace Statistics</CardTitle>
          <CardDescription>
            Overview of workspace data and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 border rounded-lg">
              <div class="text-2xl font-bold">{{ workspaceStore.workspaceCount }}</div>
              <div class="text-sm text-muted-foreground">Total Workspaces</div>
            </div>

            <div class="text-center p-4 border rounded-lg">
              <div class="text-2xl font-bold">1</div>
              <div class="text-sm text-muted-foreground">Active Workspace</div>
            </div>

            <div class="text-center p-4 border rounded-lg">
              <div class="text-2xl font-bold">
                {{ workspaceStore.hasPersistedWorkspace() ? 'Yes' : 'No' }}
              </div>
              <div class="text-sm text-muted-foreground">Persisted Selection</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Available Workspaces Card -->
      <Card v-if="workspaceStore.workspaces.length > 1">
        <CardHeader>
          <CardTitle>Available Workspaces</CardTitle>
          <CardDescription>
            Switch between your accessible workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="workspace in workspaceStore.workspaces"
              :key="workspace.id"
              class="p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent"
              :class="{
                'border-primary bg-primary/5': workspace.id === currentWorkspace?.id,
                'border-border': workspace.id !== currentWorkspace?.id
              }"
              @click="handleSelectWorkspace(workspace.id)"
            >
              <div class="flex items-center gap-2">
                <Building2 class="h-4 w-4" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ workspace.name }}</div>
                  <div v-if="workspace.description" class="text-xs text-muted-foreground truncate">
                    {{ workspace.description }}
                  </div>
                </div>
                <div v-if="workspace.id === currentWorkspace?.id" class="w-2 h-2 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
