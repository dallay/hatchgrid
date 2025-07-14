<template>
  <div class="flex items-center gap-2">
    <label for="language-select" class="text-sm font-medium">
      {{ t('navigation.language') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      @change="handleLanguageChange"
      class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      :disabled="translationStore.isLoading"
    >
      <option
        v-for="language in translationStore.availableLanguages"
        :key="language.code"
        :value="language.code"
      >
        {{ language.flag }} {{ language.name }}
      </option>
    </select>
    <div v-if="translationStore.isLoading" class="ml-2">
      <span class="text-xs text-gray-500">{{ t('common.loading') }}...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type TranslationService from "@/i18n/translation.service.ts";
import { useTranslationStore } from "@/stores/translation";

// Use i18n for reactive translations
const { t } = useI18n();

// Access stores and services
const translationStore = useTranslationStore();
const translationService = inject<TranslationService>("translationService");

// Local reactive state
const selectedLanguage = ref(translationStore.currentLanguage);

// Handle language change
const handleLanguageChange = async () => {
	if (!translationService) {
		console.error("Translation service not available");
		return;
	}

	try {
		await translationService.refreshTranslation(selectedLanguage.value);
		translationStore.setCurrentLanguage(selectedLanguage.value);
	} catch (error) {
		console.error("Failed to change language:", error);
		// Reset to current language on error
		selectedLanguage.value = translationStore.currentLanguage;
	}
};

// Initialize component
onMounted(() => {
	selectedLanguage.value = translationStore.currentLanguage;
});
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
