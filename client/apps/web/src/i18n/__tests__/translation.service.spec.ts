import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import type { Composer } from "vue-i18n";
import TranslationService from "../translation.service.ts";

vi.mock("../../i18n/en/en.js", () => {
	return {
		default: {
			mocked: "value",
		},
	};
});

describe("TranslationService", () => {
	let service: TranslationService;
	let mockI18n: Pick<
		Composer,
		"locale" | "messages" | "setLocaleMessage" | "t" | "te"
	>;

	beforeEach(() => {
		setActivePinia(createPinia());
		mockI18n = {
			locale: ref("en"),
			messages: computed(() => ({ es: { message: "hola" } })), // Start with 'es' loaded
			setLocaleMessage: vi.fn(),
			t: vi.fn().mockReturnValue("translation"),
			te: vi.fn().mockReturnValue(true),
		} as any;
		service = new TranslationService(mockI18n as Composer);
		vi.clearAllMocks();
	});

	it("should set the current language", () => {
		service.setLocale("es");
		expect(mockI18n.locale.value).toBe("es");
	});

	it("should refresh translations if language is not loaded", async () => {
		await service.refreshTranslation("en");
		expect(mockI18n.setLocaleMessage).toHaveBeenCalledWith("en", {
			mocked: "value",
		});
	});

	it("should not refresh translations if language is already loaded", async () => {
		await service.refreshTranslation("es");
		expect(mockI18n.setLocaleMessage).not.toHaveBeenCalled();
	});
});
