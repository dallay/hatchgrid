<script setup lang="ts">
import { computed } from "vue";
import type { Tag } from "../../../domain/models";

interface Props {
	readonly tag: Tag | null;
	readonly open: boolean;
	readonly loading?: boolean;
}

interface Emits {
	(event: "confirm"): void;
	(event: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
});

const emit = defineEmits<Emits>();

// Computed properties
const hasSubscribers = computed(() => {
	return props.tag && props.tag.subscriberCount > 0;
});

const warningMessage = computed(() => {
	if (!props.tag) return "";

	if (hasSubscribers.value) {
		const count = props.tag.subscriberCount;
		return `This tag is currently assigned to ${count} ${count === 1 ? "subscriber" : "subscribers"}. Deleting it will remove the tag from all subscribers.`;
	}

	return "This action cannot be undone.";
});
</script>

<template>
  <!-- Modal Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center"
    data-testid="delete-confirmation-modal"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 transition-opacity"
      @click="emit('cancel')"
      aria-hidden="true"
    />

    <!-- Modal Content -->
    <div
      class="relative bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="tag ? `delete-tag-${tag.id}-title` : 'delete-tag-title'"
    >
      <!-- Header -->
      <div class="flex items-center space-x-3 mb-4">
        <div class="flex-shrink-0">
          <div class="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg class="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3
            :id="tag ? `delete-tag-${tag.id}-title` : 'delete-tag-title'"
            class="text-lg font-semibold text-foreground"
            data-testid="modal-title"
          >
            Delete Tag
          </h3>
          <p v-if="tag" class="text-sm text-muted-foreground mt-1">
            Are you sure you want to delete "{{ tag.name }}"?
          </p>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="mb-6">
        <div
          class="p-3 rounded-lg border"
          :class="{
            'bg-destructive/5 border-destructive/20': hasSubscribers,
            'bg-muted/50 border-border': !hasSubscribers,
          }"
        >
          <p
            class="text-sm"
            :class="{
              'text-destructive': hasSubscribers,
              'text-muted-foreground': !hasSubscribers,
            }"
            data-testid="warning-message"
          >
            {{ warningMessage }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-input rounded-md hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="emit('confirm')"
          class="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50 flex items-center space-x-2"
          :disabled="loading"
          data-testid="confirm-button"
        >
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{ loading ? 'Deleting...' : 'Delete Tag' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
