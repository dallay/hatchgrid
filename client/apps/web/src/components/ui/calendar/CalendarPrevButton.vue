<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { ChevronLeft } from "lucide-vue-next";
import { CalendarPrev, type CalendarPrevProps, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const props = defineProps<
	CalendarPrevProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <CalendarPrev
    data-slot="calendar-prev-button"
    :class="cn(
      buttonVariants({ variant: 'outline' }),
      'absolute left-1',
      'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot>
      <ChevronLeft class="size-4" />
    </slot>
  </CalendarPrev>
</template>
