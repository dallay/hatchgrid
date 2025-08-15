<script setup lang="ts">
import { computed } from "vue";
import type { Tag } from "../../../domain/models";

interface Props {
	readonly tags: readonly Tag[];
	readonly loading?: boolean;
	readonly error?: string | null;
}

interface Emits {
	(event: "edit-tag", tag: Tag): void;
	(event: "delete-tag", tag: Tag): void;
	(event: "add-tag"): void;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	error: null,
});

const emit = defineEmits<Emits>();

/**
 * Get color classes for tag display
 */
const getTagColorClasses = (color: string) => {
	const colorMap = {
		red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
		green:
			"bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
		blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
		yellow:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
		purple:
			"bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
		gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
	} as const;

	return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};

/**
 * Computed property to check if we should show empty state
 */
const showEmptyState = computed(() => {
	return !props.loading && (props.tags?.length || 0) === 0 && !props.error;
});

/**
 * Format date for display
 */
const formatDate = (date: Date | string) => {
	return new Date(date).toLocaleDateString();
};

/**
 * Format subscriber count text
 */
const getSubscriberText = (count: number) => {
	return `${count} ${count === 1 ? "subscriber" : "subscribers"}`;
};
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
          <h3 class="font-semibold text-destructive">Error loading tags</h3>
          <p class="text-sm text-destructive/80 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-4" aria-label="Loading tags" data-testid="loading-state">
      <div v-for="i in 5" :key="`loading-${i}`" class="flex items-center space-x-4 p-4 border rounded-lg">
        <div class="h-6 w-16 bg-muted rounded-full animate-pulse" aria-hidden="true" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted rounded animate-pulse w-1/3" aria-hidden="true" />
          <div class="h-3 bg-muted rounded animate-pulse w-1/4" aria-hidden="true" />
        </div>
        <div class="flex space-x-1">
          <div class="h-8 w-8 bg-muted rounded animate-pulse" aria-hidden="true" />
          <div class="h-8 w-8 bg-muted rounded animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <span class="sr-only">Loading tags...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="showEmptyState" class="text-center py-12" data-testid="empty-state">
      <div class="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">No tags yet</h3>
      <p class="text-muted-foreground mb-6 max-w-sm mx-auto">
        Get started by creating your first tag to organize and categorize your subscribers.
      </p>
      <button
        @click="emit('add-tag')"
        class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create First Tag
      </button>
    </div>

    <!-- Tags List -->
    <div v-else class="space-y-2" role="list" aria-label="Tags list" data-testid="tags-list">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
        role="listitem"
        data-testid="tag-item"
      >
        <!-- Tag Color Badge -->
        <div class="flex-shrink-0">
          <span
            :class="getTagColorClasses(tag.color)"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ tag.name }}
          </span>
        </div>

        <!-- Tag Info -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-muted-foreground">
            {{ getSubscriberText(tag.subscriberCount) }}
          </div>
          <div v-if="tag.createdAt" class="text-xs text-muted-foreground/70 mt-1">
            Created {{ formatDate(tag.createdAt) }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0">
          <div class="flex items-center space-x-1">
            <button
              @click="emit('edit-tag', tag)"
              class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              :aria-label="`Edit ${tag.name} tag`"
              title="Edit tag"
              data-testid="edit-button"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="emit('delete-tag', tag)"
              class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              :aria-label="`Delete ${tag.name} tag`"
              title="Delete tag"
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
