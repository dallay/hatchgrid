import { createTestingPinia } from "@pinia/testing";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/auth";
import Ribbon from "./ribbon.vue";

vi.mock("vue-i18n", () => ({
	useI18n: () => ({
		t: (key: string) => key,
	}),
}));

describe("Ribbon", () => {
	let wrapper: VueWrapper<InstanceType<typeof Ribbon>>;
	let store: ReturnType<typeof useAuthStore>;

	beforeEach(() => {
		wrapper = shallowMount(Ribbon, {
			global: {
				plugins: [createTestingPinia({ stubActions: false })],
			},
		});
		store = useAuthStore();
	});

	it("should not have ribbonEnabled when no data", () => {
		expect(wrapper.vm.ribbonEnabled).toBeFalsy();
	});

	it("should have ribbonEnabled set to value in store", async () => {
		const profile = "dev";
		store.activeProfiles = ["foo", profile, "bar"];
		store.ribbonOnProfiles = profile;
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.ribbonEnabled).toBeTruthy();
	});

	it("should not have ribbonEnabled when profile not activated", async () => {
		const profile = "dev";
		store.activeProfiles = ["foo", "bar"];
		store.ribbonOnProfiles = profile;
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.ribbonEnabled).toBeFalsy();
	});
});
