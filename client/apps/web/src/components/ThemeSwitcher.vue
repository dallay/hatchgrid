<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { onMounted, ref, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import MoonIcon from "~icons/ph/moon?raw";
import SunIcon from "~icons/ph/sun?raw";

const isDark = useDark();
const toggleMode = useToggle(isDark);

const mode = ref<"light" | "dark">("light");

// Load theme from localStorage or system preference
onMounted(() => {
	const saved = localStorage.getItem("theme");
	if (saved === "dark" || saved === "light") {
		mode.value = saved;
	} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		mode.value = "dark";
	}
});

// Watch and apply theme
watchEffect(() => {
	document.documentElement.classList.toggle("dark", mode.value === "dark");
	localStorage.setItem("theme", mode.value);
});
</script>

<template>
  <Button variant="ghost" size="icon" @click="toggleMode">
      <span v-if="isDark" v-html="SunIcon"></span>
      <span v-else v-html="MoonIcon"></span>
    </Button>
</template>
