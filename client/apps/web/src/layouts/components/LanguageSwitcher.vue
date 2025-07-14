<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
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

// Define props to control the display style
const props = withDefaults(defineProps<{
  displayMode?: 'icon' | 'select';
}>(), {
  displayMode: 'icon', // Default to the compact icon view
});

// Composables and services for translation
const { t } = useI18n();
const translationStore = useTranslationStore();
const translationService = inject<TranslationService>("translationService");

// Local reactive state for the <select> element
const selectedLanguage = ref(translationStore.currentLanguage);

/**
 * Handles the language change logic.
 * @param languageCode The code of the language to switch to.
 */
async function changeLanguage(languageCode: string | undefined) {
  if (!languageCode || !translationService) {
    console.error("Language code or translation service is not available.");
    return;
  }

  try {
    // Refresh translations and update the application's locale
    await translationService.refreshTranslation(languageCode);
    translationService.setLocale(languageCode);
    translationStore.setCurrentLanguage(languageCode);
  } catch (error) {
    console.error("Failed to change language:", error);
    // On failure, revert the select element to the currently active language
    selectedLanguage.value = translationStore.currentLanguage;
  }
}

// This function is specifically for the @change event of the <select> element
const handleSelectChange = () => {
  changeLanguage(selectedLanguage.value);
};

// Ensure the local state (selectedLanguage) is initialized correctly
onMounted(() => {
  selectedLanguage.value = translationStore.currentLanguage;
});

// Watch for changes in the store to keep the local state in sync
watch(() => translationStore.currentLanguage, (newLang) => {
  selectedLanguage.value = newLang;
});
</script>

<template>
  <!-- Display as a <select> dropdown -->
  <div v-if="displayMode === 'select'" class="flex items-center gap-2">
    <label for="language-select" class="text-sm font-medium">
      {{ t('navigation.language') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      @change="handleSelectChange"
      class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option
        v-for="language in translationStore.availableLanguages"
        :key="language.code"
        :value="language.code"
      >
        {{ language.flag }} {{ language.name }}
      </option>
    </select>
  </div>

  <!-- Display as a compact icon with a dropdown menu -->
  <DropdownMenu v-else>
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

<style scoped>
/* Add any component-specific styles here if needed */
</style>