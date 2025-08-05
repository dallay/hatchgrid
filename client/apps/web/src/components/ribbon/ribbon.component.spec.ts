// @vitest-environment happy-dom
import { createTestingPinia } from "@pinia/testing";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/authentication/infrastructure/store";
import Ribbon from "./ribbon.vue";

vi.mock("vue-i18n", () => ({
	useI18n: () => ({
		t: (key: string) => key,
	}),
}));

describe("Ribbon", () => {
	let wrapper: VueWrapper<InstanceType<typeof Ribbon>>;

	function createWrapper(initialState = {}) {
		wrapper = shallowMount(Ribbon, {
			global: {
				plugins: [
					createTestingPinia({
						initialState,
						stubActions: false,
						createSpy: vi.fn,
					}),
				],
			},
		});
	}

	it("should not have ribbonEnabled when no data", () => {
		createWrapper();
		const store = useAuthStore();
		expect(store.ribbonOnProfiles).toBeFalsy();
		expect(wrapper.find("[data-testid='ribbon']").exists()).toBe(false);
	});

	it("should have ribbonEnabled set to value in store", () => {
		const profile = "dev";
		createWrapper({
			auth: {
				ribbonOnProfiles: profile,
				activeProfiles: ["foo", profile, "bar"],
			},
		});
		const store = useAuthStore();
		expect(store.ribbonOnProfiles).toBe(profile);
		expect(store.activeProfiles).toContain(profile);
		expect(wrapper.find("[data-testid='ribbon']").exists()).toBeTruthy();
	});

	it("should not have ribbonEnabled when profile not activated", () => {
		const profile = "dev";
		createWrapper({
			auth: {
				ribbonOnProfiles: profile,
				activeProfiles: ["foo", "bar"],
			},
		});
		expect(wrapper.find("[data-testid='ribbon']").exists()).toBeFalsy();
	});

	it("should become enabled when profile is activated", async () => {
		const profile = "dev";
		createWrapper({
			auth: {
				ribbonOnProfiles: profile,
				activeProfiles: ["foo", "bar"],
			},
		});
		expect(wrapper.find("[data-testid='ribbon']").exists()).toBeFalsy();

		const store = useAuthStore();
		store.activeProfiles.push(profile);
		await wrapper.vm.$nextTick();

		expect(wrapper.find("[data-testid='ribbon']").exists()).toBeTruthy();
	});
});
