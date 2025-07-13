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

	it("should return the key when translation is missing", () => {
		const translationStore = useTranslationStore();
		translationStore.setTranslations("en", {});

		const t = useTranslations("en");
		const translatedText = t("missing.key");

		expect(translatedText).toBe("missing.key");
	});

	it("should handle language switching", () => {
		const translationStore = useTranslationStore();
		translationStore.setTranslations("en", { "hello": "Hello" });
		translationStore.setTranslations("es", { "hello": "Hola" });

		const tEn = useTranslations("en");
		const tEs = useTranslations("es");

		expect(tEn("hello")).toBe("Hello");
		expect(tEs("hello")).toBe("Hola");
	});
});
