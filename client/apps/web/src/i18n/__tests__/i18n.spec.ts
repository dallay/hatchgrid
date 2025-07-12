import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useTranslationStore } from "@/stores/translation.store";
import { useTranslations } from "../i18n";

describe("i18n", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("should return the correct translation", () => {
		const translationStore = useTranslationStore();
		translationStore.setTranslations("en", {
			"hello.world": "Hello, World!",
		});

		const t = useTranslations("en");
		const translatedText = t("hello.world");

		expect(translatedText).toBe("Hello, World!");
	});
});
