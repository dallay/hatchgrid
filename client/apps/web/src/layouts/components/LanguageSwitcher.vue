<script setup lang="ts">
import { inject } from "vue";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type TranslationService from "@/services/translation.service";
import { useTranslationStore } from "@/stores/translation";
import PhGlobeLight from "~icons/ph/globe-light";

const translationStore = useTranslationStore();
const translationService = inject<TranslationService>("translationService");

async function changeLanguage(languageCode: string) {
	if (translationService) {
		await translationService.refreshTranslation(languageCode);
		translationService.setLocale(languageCode);
	}
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
