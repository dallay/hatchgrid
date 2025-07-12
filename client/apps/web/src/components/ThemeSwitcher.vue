<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import MoonIcon from "~icons/ph/moon?raw";
import SunIcon from "~icons/ph/sun?raw";

const isDark = useDark();
const toggleMode = useToggle(isDark);
</script>

<template>
  <Button variant="ghost" size="icon" @click="toggleMode()">
      <span v-if="isDark" v-html="SunIcon"></span>
      <span v-else v-html="MoonIcon"></span>
    </Button>
</template>
