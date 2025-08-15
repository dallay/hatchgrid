<script setup lang="ts">
import type { Tag } from "../../../domain/models";

interface Props {
	readonly tag: Tag;
	readonly showActions?: boolean;
}

interface Emits {
	(event: "edit", tag: Tag): void;
	(event: "delete", tag: Tag): void;
}

withDefaults(defineProps<Props>(), {
	showActions: true,
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
</script>

<template>
  <div
    class="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
    data-testid="tag-item"
  >
    <!-- Tag Color Badge -->
    <div class="flex-shrink-0">
      <span
        :class="getTagColorClasses(tag.color)"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        data-testid="tag-badge"
      >
        {{ tag.name }}
      </span>
    </div>

    <!-- Tag Info -->
    <div class="flex-1 min-w-0">
      <div class="text-sm text-muted-foreground" data-testid="subscriber-count">
        {{ tag.subscriberCount }} {{ tag.subscriberCount === 1 ? 'subscriber' : 'subscribers' }}
      </div>
      <div v-if="tag.createdAt" class="text-xs text-muted-foreground/70 mt-1" data-testid="created-date">
        Created {{ new Date(tag.createdAt).toLocaleDateString() }}
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="flex-shrink-0">
      <div class="flex items-center space-x-1">
        <button
          @click="emit('edit', tag)"
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
          @click="emit('delete', tag)"
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
</template>
