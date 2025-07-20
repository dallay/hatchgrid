<template>
  <div class="language-switcher">
    <div class="current-language">
      {{ t('common.welcome') }}
    </div>
    <div class="language-options">
      <button
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        :class="{ active: locale === lang.code }"
        :aria-label="`Switch to ${lang.name}`"
      >
        {{ lang.flag }} {{ lang.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTranslation } from "@/composables/useTranslation";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";

const { t, locale, changeLanguage } = useTranslation();
const isLoading = ref(false);

const availableLanguages = Object.entries(SUPPORTED_LANGUAGES).map(
	([code, data]) => ({
		code,
		name: data.name,
		flag: data.flag,
	}),
);

const switchLanguage = async (langCode: string) => {
	if (locale.value !== langCode && !isLoading.value) {
		isLoading.value = true;
		await changeLanguage(langCode);
		isLoading.value = false;
	}
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.language-options {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button.active {
  background: #eee;
  font-weight: bold;
}
</style>
