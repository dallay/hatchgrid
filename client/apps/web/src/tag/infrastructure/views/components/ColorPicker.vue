<script setup lang="ts">
import { TagColors } from "../../../domain/models";

interface ColorOption {
	readonly value: TagColors;
	readonly label: string;
	readonly class: string;
}

interface Props {
	readonly modelValue: TagColors;
	readonly disabled?: boolean;
	readonly error?: string;
}

type Emits = (event: "update:modelValue", value: TagColors) => void;

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	error: undefined,
});

const emit = defineEmits<Emits>();

// Available color options
const COLOR_OPTIONS: readonly ColorOption[] = [
	{ value: TagColors.Red, label: "Red", class: "bg-red-500" },
	{ value: TagColors.Green, label: "Green", class: "bg-green-500" },
	{ value: TagColors.Blue, label: "Blue", class: "bg-blue-500" },
	{ value: TagColors.Yellow, label: "Yellow", class: "bg-yellow-500" },
	{ value: TagColors.Purple, label: "Purple", class: "bg-purple-500" },
	{ value: TagColors.Gray, label: "Gray", class: "bg-gray-500" },
] as const;

const updateValue = (value: TagColors) => {
	emit("update:modelValue", value);
};
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium text-foreground">
      Tag Color <span class="text-destructive">*</span>
    </legend>
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup">
      <div
        v-for="option in COLOR_OPTIONS"
        :key="option.value"
        class="relative"
      >
        <input
          :id="`color-${option.value}`"
          :checked="modelValue === option.value"
          type="radio"
          :value="option.value"
          class="sr-only"
          :disabled="props.disabled"
          :data-testid="`color-${option.value}`"
          @change="updateValue(option.value)"
        />
        <label
          :for="`color-${option.value}`"
          class="flex flex-col items-center space-y-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          :class="{
            'border-primary bg-primary/5': modelValue === option.value,
            'border-input': modelValue !== option.value,
            'cursor-not-allowed opacity-50': props.disabled,
          }"
        >
          <div
            :class="option.class"
            class="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          />
          <span class="text-xs font-medium text-foreground">{{ option.label }}</span>
        </label>
      </div>
    </div>
    <div v-if="props.error" class="text-sm text-destructive mt-2" data-testid="color-error">
      {{ props.error }}
    </div>
  </fieldset>
</template>
