<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { ContextMenuLabel, type ContextMenuLabelProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<
	ContextMenuLabelProps & { class?: HTMLAttributes["class"]; inset?: boolean }
>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <ContextMenuLabel
    data-slot="context-menu-label"
    :data-inset="inset ? '' : undefined"
    v-bind="delegatedProps"
    :class="cn('text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
  >
    <slot />
  </ContextMenuLabel>
</template>
