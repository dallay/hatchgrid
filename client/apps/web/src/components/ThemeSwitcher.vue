<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import PhMoon from "~icons/ph/moon";
import PhSun from "~icons/ph/sun";

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

const toggleDark = () => {
	mode.value = mode.value === "dark" ? "light" : "dark";
};
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleDark"
    class="flex items-center space-x-1"
  >
    <PhMoon v-if="mode === 'light'" class="h-4 w-4" />
    <PhSun v-else class="h-4 w-4" />
  </Button>
</template>
