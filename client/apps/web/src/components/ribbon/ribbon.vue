<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();
const { t: t$ } = useI18n();

const ribbonEnv = computed(() => store.ribbonOnProfiles);
const ribbonEnabled = computed(
	() =>
		store.ribbonOnProfiles &&
		store.activeProfiles.includes(store.ribbonOnProfiles),
);
</script>
<template>
  <div
      v-if="ribbonEnabled"
      data-testid="ribbon"
      class="fixed top-10 right-[-3.5rem] z-[1000] rotate-45 pointer-events-none opacity-75"
  >
    <div
        class="bg-red-700/60 text-white text-sm font-medium shadow-md px-12 py-2 text-center w-[15em] whitespace-nowrap pointer-events-none"
    >
      {{ t$('global.ribbon.' + ribbonEnv) }}
    </div>
  </div>
</template>
