import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
//import { useTranslationStore } from "@/stores/translation.store";
import TranslationService from "../translation.service";

describe("TranslationService", () => {
	let service: TranslationService;
	let mockI18n: any;

	beforeEach(() => {
		setActivePinia(createPinia());
		mockI18n = {
			locale: { value: "en" },
			setLocaleMessage: vi.fn(),
			t: vi.fn().mockReturnValue("translation"),
			te: vi.fn().mockReturnValue(true),
		};
		service = new TranslationService(mockI18n);
	});

	it("should set the current language", () => {
		service.setLocale("es");
		// const store = useTranslationStore();
		// Optionally check mockI18n.locale.value
		expect(mockI18n.locale.value).toBe("es");
	});

	it("should refresh translations", async () => {
		await service.refreshTranslation("en");
		// const store = useTranslationStore();
		// Optionally check mockI18n.setLocaleMessage called
		expect(mockI18n.setLocaleMessage).toHaveBeenCalled();
	});
});
