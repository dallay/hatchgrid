<script setup lang="ts">
import { computed } from "vue";
import { useTranslation } from "@/composables/useTranslation";
import { useTranslationStore } from "@/stores/translation.store";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PhGlobeLight from "~icons/ph/globe-light";

const { switchLanguage, locale } = useTranslation();
const translationStore = useTranslationStore();

const availableLanguages = computed(() => translationStore.supportedLanguages);
const currentLanguage = computed(() =>
	availableLanguages.value.find((lang) => lang.code === locale.value),
);

const handleLanguageSwitch = async (languageCode: string) => {
	await switchLanguage(languageCode);
};
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="ghost" size="icon">
				<PhGlobeLight />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem
				v-for="lang in availableLanguages"
				:key="lang.code"
				@click="handleLanguageSwitch(lang.code)"
			>
				{{ lang.name }}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
