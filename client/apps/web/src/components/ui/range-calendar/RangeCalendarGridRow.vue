<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import {
	RangeCalendarGridRow,
	type RangeCalendarGridRowProps,
	useForwardProps,
} from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<
	RangeCalendarGridRowProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RangeCalendarGridRow
    data-slot="range-calendar-grid-row"
    :class="cn('flex', props.class)" v-bind="forwardedProps"
  >
    <slot />
  </RangeCalendarGridRow>
</template>
