<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { AlertDialogTitle, type AlertDialogTitleProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<
	AlertDialogTitleProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    :class="cn('text-lg font-semibold', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
