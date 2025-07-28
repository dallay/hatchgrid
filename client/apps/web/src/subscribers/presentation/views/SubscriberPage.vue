<script setup lang="ts">
import {
	Plus,
	RefreshCw,
	UserCheck,
	UserMinus,
	Users,
	UserX,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscribers } from "../../composables/useSubscribers";
import type { Attributes, Subscriber } from "../../domain/models";
import { SubscriberList } from "../components";

// Mock workspace ID - in a real app this would come from route params or auth store
const workspaceId = ref("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

// Use the composable which handles auto-initialization
const {
	subscribers,
	statusCounts,
	isLoading,
	hasError,
	error,
	subscriberCount,
	fetchAllData,
	refreshData,
} = useSubscribers();

// Helper to ensure all string[] in attributes are mutable and type-safe
type AnyAttributes = {
	[key: string]: string | number | boolean | string[] | readonly string[];
};
function toMutableAttributes(
	attributes: AnyAttributes | undefined,
): Attributes | undefined {
	if (!attributes) return undefined;
	const mutable: Record<string, string | number | boolean | string[]> = {};
	for (const [k, v] of Object.entries(attributes)) {
		if (Array.isArray(v)) {
			mutable[k] = Array.from(v);
		} else if (
			typeof v === "string" ||
			typeof v === "number" ||
			typeof v === "boolean"
		) {
			mutable[k] = v;
		}
		// else: skip invalid types
	}
	return mutable as Attributes;
}

const subscribersForList = computed(() =>
	(subscribers.value ?? []).map((s) => ({
		...s,
		attributes: toMutableAttributes(s.attributes),
	})),
);

// Loading and error states
const isRefreshing = ref(false);

// Status count helpers
const getStatusCount = (status: string) => {
	const statusCount = statusCounts.value.find((s) => s.status === status);
	return statusCount?.count || 0;
};

const enabledCount = computed(() => getStatusCount("ENABLED"));
const disabledCount = computed(() => getStatusCount("DISABLED"));
const blocklistedCount = computed(() => getStatusCount("BLOCKLISTED"));

// Load data on component mount
onMounted(async () => {
	try {
		await fetchAllData(workspaceId.value);
	} catch (err) {
		console.error("Failed to load subscriber data:", err);
	}
});

// Event handlers
const handleRefresh = async () => {
	isRefreshing.value = true;
	try {
		await refreshData(workspaceId.value);
	} catch (err) {
		console.error("Failed to refresh data:", err);
	} finally {
		isRefreshing.value = false;
	}
};

const handleEditSubscriber = (subscriber: Subscriber) => {
	// TODO: Implement edit functionality
	console.log("Edit subscriber:", subscriber);
};

const handleDeleteSubscriber = (subscriber: Subscriber) => {
	// TODO: Implement delete functionality
	console.log("Delete subscriber:", subscriber);
};

const handleToggleStatus = (subscriber: Subscriber) => {
	// TODO: Implement status toggle functionality
	console.log("Toggle status for subscriber:", subscriber);
};

const handleAddSubscriber = () => {
	// TODO: Implement add subscriber functionality
	console.log("Add new subscriber");
};
</script>

<template>
  <div class="flex-1 space-y-4 p-8 pt-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Subscribers</h1>
        <p class="text-muted-foreground">
          Manage your subscriber list and view engagement metrics
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="handleRefresh"
          :disabled="isLoading || isRefreshing"
        >
          <RefreshCw :class="{ 'animate-spin': isRefreshing }" class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="handleAddSubscriber">
          <Plus class="h-4 w-4 mr-2" />
          Add Subscriber
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Total Subscribers -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Subscribers</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-24" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold">{{ subscriberCount.toLocaleString() }}</div>
            <p class="text-xs text-muted-foreground">Total active subscribers</p>
          </div>
        </CardContent>
      </Card>

      <!-- Active Subscribers -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active</CardTitle>
          <UserCheck class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-24" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold text-green-600">
              {{ enabledCount.toLocaleString() }}
            </div>
            <p class="text-xs text-muted-foreground">Enabled subscribers</p>
          </div>
        </CardContent>
      </Card>

      <!-- Disabled Subscribers -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Disabled</CardTitle>
          <UserMinus class="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-24" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold text-yellow-600">
              {{ disabledCount.toLocaleString() }}
            </div>
            <p class="text-xs text-muted-foreground">Temporarily disabled</p>
          </div>
        </CardContent>
      </Card>

      <!-- Blocked Subscribers -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Blocked</CardTitle>
          <UserX class="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-24" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold text-red-600">
              {{ blocklistedCount.toLocaleString() }}
            </div>
            <p class="text-xs text-muted-foreground">Blocked subscribers</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error Alert -->
    <Alert v-if="hasError" variant="destructive">
      <AlertDescription>
        {{ error?.message }}
      </AlertDescription>
    </Alert>

    <!-- Subscribers List -->
    <Card>
      <CardHeader>
        <CardTitle>Subscriber List</CardTitle>
        <CardDescription>
          View and manage all subscribers in your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubscriberList
          :subscribers="subscribersForList"
          :loading="isLoading"
          :error="error?.message"
          @edit-subscriber="handleEditSubscriber"
          @delete-subscriber="handleDeleteSubscriber"
          @toggle-status="handleToggleStatus"
          @add-subscriber="handleAddSubscriber"
        />
      </CardContent>
    </Card>
  </div>
</template>
