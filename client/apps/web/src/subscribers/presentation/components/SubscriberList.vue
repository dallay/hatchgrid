<script setup lang="ts">
import { formatDate, initials } from "@hatchgrid/utilities";
import { computed } from "vue";
import type { Subscriber, SubscriberStatus } from "../../domain/models";
import {
	getSubscriberDisplayName,
	isActiveSubscriber,
} from "../../domain/models/Subscriber";

interface Props {
	readonly subscribers: readonly Subscriber[];
	readonly loading?: boolean;
	readonly error?: string | null;
}

interface Emits {
	(event: "edit-subscriber", subscriber: Subscriber): void;
	(event: "delete-subscriber", subscriber: Subscriber): void;
	(event: "toggle-status", subscriber: Subscriber): void;
	(event: "add-subscriber"): void;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	error: null,
});

const emit = defineEmits<Emits>();

/**
 * Status configuration for consistent styling and text
 */
const statusConfig = {
	ENABLED: {
		text: "Active",
		classes:
			"bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
	},
	DISABLED: {
		text: "Disabled",
		classes:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
	},
	BLOCKLISTED: {
		text: "Blocked",
		classes: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
	},
} as const;

/**
 * Get status configuration for a subscriber
 */
const getStatusConfig = (status: SubscriberStatus) => {
	return (
		statusConfig[status] || {
			text: status,
			classes: "bg-gray-100 text-gray-800",
		}
	);
};

/**
 * Get initials for avatar display
 */
const getInitials = (subscriber: Subscriber): string => {
	const displayName = getSubscriberDisplayName(subscriber);
	return initials(displayName).toUpperCase().substring(0, 2);
};

/**
 * Computed property to check if we should show empty state
 */
const showEmptyState = computed(() => {
	return (
		!props.loading && (props.subscribers?.length || 0) === 0 && !props.error
	);
});
</script>

<template>
  <div class="space-y-4">
    <!-- Error State -->
    <div v-if="error" class="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
      <div class="flex items-center space-x-2">
        <div class="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
          <span class="text-destructive-foreground text-xs font-bold">!</span>
        </div>
        <div>
          <h3 class="font-semibold text-destructive">Error loading subscribers</h3>
          <p class="text-sm text-destructive/80 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-4" aria-label="Loading subscribers" data-testid="loading-state">
      <div v-for="i in 5" :key="`loading-${i}`" class="flex items-center space-x-4 p-4 border rounded-lg">
        <div class="h-10 w-10 rounded-full bg-muted animate-pulse" aria-hidden="true"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted rounded animate-pulse w-1/3" aria-hidden="true"></div>
          <div class="h-3 bg-muted rounded animate-pulse w-1/2" aria-hidden="true"></div>
          <div class="h-3 bg-muted rounded animate-pulse w-1/4 mt-1" aria-hidden="true"></div>
        </div>
        <div class="h-6 w-16 bg-muted rounded animate-pulse" aria-hidden="true"></div>
        <div class="flex space-x-1">
          <div class="h-8 w-8 bg-muted rounded animate-pulse" aria-hidden="true"></div>
          <div class="h-8 w-8 bg-muted rounded animate-pulse" aria-hidden="true"></div>
          <div class="h-8 w-8 bg-muted rounded animate-pulse" aria-hidden="true"></div>
        </div>
      </div>
      <span class="sr-only">Loading subscribers...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="showEmptyState" class="text-center py-12" data-testid="empty-state">
      <div class="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">No subscribers yet</h3>
      <p class="text-muted-foreground mb-6 max-w-sm mx-auto">
        Get started by adding your first subscriber to begin building your audience.
      </p>
      <button
        @click="emit('add-subscriber')"
        class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add First Subscriber
      </button>
    </div>

    <!-- Subscribers List -->
    <div v-else class="space-y-2" role="list" aria-label="Subscribers list" data-testid="subscribers-list">
      <div
        v-for="subscriber in subscribers"
        :key="subscriber.id"
        class="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
        role="listitem"
        data-testid="subscriber-item"
      >
        <!-- Avatar -->
        <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-sm font-semibold text-primary" data-testid="avatar-fallback">
            {{ getInitials(subscriber) }}
          </span>
        </div>

        <!-- Subscriber Info -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-foreground truncate">
            {{ getSubscriberDisplayName(subscriber) }}
          </div>
          <div class="text-sm text-muted-foreground truncate">
            {{ subscriber.email }}
          </div>
          <div v-if="subscriber.createdAt" class="text-xs text-muted-foreground/70 mt-1">
            Joined {{ formatDate(subscriber.createdAt) || 'recently' }}
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex-shrink-0">
          <span
            :class="getStatusConfig(subscriber.status).classes"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          >
            {{ getStatusConfig(subscriber.status).text }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0">
          <div class="flex items-center space-x-1">
            <button
              @click="emit('edit-subscriber', subscriber)"
              class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              :aria-label="`Edit ${getSubscriberDisplayName(subscriber)}`"
              title="Edit subscriber"
              data-testid="edit-button"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="emit('toggle-status', subscriber)"
              class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              :aria-label="`${isActiveSubscriber(subscriber) ? 'Disable' : 'Enable'} ${getSubscriberDisplayName(subscriber)}`"
              :title="`${isActiveSubscriber(subscriber) ? 'Disable' : 'Enable'} subscriber`"
              data-testid="toggle-status-button"
            >
              <svg v-if="isActiveSubscriber(subscriber)" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              @click="emit('delete-subscriber', subscriber)"
              class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              :aria-label="`Delete ${getSubscriberDisplayName(subscriber)}`"
              title="Delete subscriber"
              data-testid="delete-button"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
