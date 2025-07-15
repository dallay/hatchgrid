<template>
  <Ribbon />
  <main>
    <slot />
  </main>
</template>

<script setup lang="ts">
import Ribbon from "@/components/ribbon/ribbon.vue";
</script>
