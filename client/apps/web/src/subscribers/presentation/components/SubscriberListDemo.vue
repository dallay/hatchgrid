<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import type { Subscriber } from "../../domain/models";
import { SubscriberStatus } from "../../domain/models";
import { SubscriberList } from ".";

// Demo data
const mockSubscribers: Subscriber[] = [
	{
		id: "1",
		email: "john@example.com",
		name: "John Doe",
		status: SubscriberStatus.ENABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		email: "jane@example.com",
		status: SubscriberStatus.DISABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-02T00:00:00Z",
	},
	{
		id: "3",
		email: "blocked@example.com",
		name: "Blocked User",
		status: SubscriberStatus.BLOCKLISTED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-03T00:00:00Z",
	},
];

// State management
const currentState = ref<"loading" | "error" | "empty" | "data">("data");
const subscribers = ref<Subscriber[]>(mockSubscribers);
const loading = ref(false);
const error = ref<string | null>(null);

// State handlers
const showLoadingState = () => {
	currentState.value = "loading";
	loading.value = true;
	error.value = null;
	subscribers.value = [];
};

const showErrorState = () => {
	currentState.value = "error";
	loading.value = false;
	error.value = "Failed to load subscribers. Please try again.";
	subscribers.value = [];
};

const showEmptyState = () => {
	currentState.value = "empty";
	loading.value = false;
	error.value = null;
	subscribers.value = [];
};

const showDataState = () => {
	currentState.value = "data";
	loading.value = false;
	error.value = null;
	subscribers.value = mockSubscribers;
};

// Event handlers
const handleEditSubscriber = (subscriber: Subscriber) => {
	console.log("Edit subscriber:", subscriber);
};

const handleDeleteSubscriber = (subscriber: Subscriber) => {
	console.log("Delete subscriber:", subscriber);
};

const handleToggleStatus = (subscriber: Subscriber) => {
	console.log("Toggle status for subscriber:", subscriber);
};

const handleAddSubscriber = () => {
	console.log("Add new subscriber");
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-4">SubscriberList UI States Demo</h2>
      <p class="text-muted-foreground mb-6">
        This demo shows different UI states for the SubscriberList component.
      </p>

      <!-- State Controls -->
      <div class="flex gap-2 mb-6">
        <Button
          @click="showLoadingState"
          :variant="currentState === 'loading' ? 'default' : 'outline'"
          size="sm"
        >
          Loading State
        </Button>
        <Button
          @click="showErrorState"
          :variant="currentState === 'error' ? 'default' : 'outline'"
          size="sm"
        >
          Error State
        </Button>
        <Button
          @click="showEmptyState"
          :variant="currentState === 'empty' ? 'default' : 'outline'"
          size="sm"
        >
          Empty State
        </Button>
        <Button
          @click="showDataState"
          :variant="currentState === 'data' ? 'default' : 'outline'"
          size="sm"
        >
          Data State
        </Button>
      </div>
    </div>

    <!-- Current State Display -->
    <div class="border rounded-lg p-4">
      <div class="mb-4">
        <span class="text-sm font-medium text-muted-foreground">Current State: </span>
        <span class="text-sm font-semibold capitalize">{{ currentState }}</span>
      </div>

      <SubscriberList
        :subscribers="subscribers"
        :loading="loading"
        :error="error"
        @edit-subscriber="handleEditSubscriber"
        @delete-subscriber="handleDeleteSubscriber"
        @toggle-status="handleToggleStatus"
        @add-subscriber="handleAddSubscriber"
      />
    </div>
  </div>
</template>
