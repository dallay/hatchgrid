import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TranslationService, { type I18nLike } from "../translation.service.ts";

vi.mock("../../i18n/en/en.js", () => {
	return {
		default: {
			mocked: "value",
		},
	};
});

describe("TranslationService", () => {
	let service: TranslationService;
	let mockI18n: I18nLike;

	beforeEach(() => {
		setActivePinia(createPinia());
		mockI18n = {
			locale: { value: "en" },
			messages: { value: { es: { message: "hola" } } }, // Start with 'es' loaded
			setLocaleMessage: vi.fn(),
		};
		service = new TranslationService(mockI18n);
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
