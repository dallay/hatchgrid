<script setup lang="ts">
import { useTranslationStore } from "@/stores/translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PhGlobeLight from "~icons/ph/globe-light";
const translationStore = useTranslationStore();
function changeLanguage(languageCode: string) {
  translationStore.setCurrentLanguage(languageCode);
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <span class="sr-only">Select Language</span>
        <PhGlobeLight />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="lang in translationStore.availableLanguages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
      >
        {{ lang.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
