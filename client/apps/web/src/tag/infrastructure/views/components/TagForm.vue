<script setup lang="ts">
import { type Ref, toRef } from "vue";
import { useTagForm } from "../../../application/composables";
import type { Tag } from "../../../domain/models";
import { TagColors } from "../../../domain/models";
import ColorPicker from "./ColorPicker.vue";

interface Props {
	readonly tag?: Tag | null;
	readonly loading?: boolean;
	readonly mode?: "create" | "edit";
}

interface Emits {
	(event: "submit", data: { name: string; color: TagColors }): void;
	(event: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
	tag: null,
	loading: false,
	mode: "create",
});

const emit = defineEmits<Emits>();

// Use the tag form composable
const {
	handleSubmit,
	errors,
	defineField,
	isFormDisabled,
	formTitle,
	submitButtonText,
	isCreateMode,
} = useTagForm({
	mode: toRef(props, "mode"),
	tag: toRef(props, "tag"),
	loading: toRef(props, "loading"),
});

// Form fields
const [name, nameAttrs] = defineField("name");
const [color] = defineField("color");

// Type assertions for form fields
const nameValue = name as Ref<string>;
const colorValue = color as Ref<TagColors>;

// Form submission
const onSubmit = handleSubmit((data) => {
	emit("submit", data);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Form Header -->
    <div>
      <h2 class="text-lg font-semibold text-foreground">{{ formTitle }}</h2>
      <p class="text-sm text-muted-foreground mt-1">
        {{ isCreateMode ? "Create a new tag to organize your subscribers." : "Update the tag information." }}
      </p>
    </div>

    <!-- Form -->
    <form @submit="onSubmit" class="space-y-4">
      <!-- Tag Name Field -->
      <div class="space-y-2">
        <label for="tag-name" class="text-sm font-medium text-foreground">
          Tag Name <span class="text-destructive">*</span>
        </label>
        <input
          id="tag-name"
          v-model="nameValue"
          v-bind="nameAttrs"
          type="text"
          placeholder="Enter tag name"
          maxlength="50"
          class="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          :class="{ 'border-destructive focus:border-destructive focus:ring-destructive/20': errors.name }"
          :disabled="loading"
          data-testid="tag-name-input"
        />
        <div v-if="errors.name" class="text-sm text-destructive" data-testid="name-error">
          {{ errors.name }}
        </div>
        <div class="text-xs text-muted-foreground">
          <span :class="{ 'text-destructive': (nameValue?.length || 0) > 45 }">
            {{ nameValue?.length || 0 }}/50 characters
          </span>
        </div>
      </div>

      <!-- Tag Color Field -->
      <div class="space-y-2">
        <ColorPicker
          v-model="colorValue"
          :disabled="loading"
          :error="errors.color"
        />
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t">
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
          type="submit"
          class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50 flex items-center space-x-2"
          :disabled="isFormDisabled"
          :aria-label="submitButtonText"
          data-testid="submit-button"
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
          <span>{{ submitButtonText }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
