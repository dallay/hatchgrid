import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import * as vueRouter from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Login from "./login.vue";

vi.mock("vue-router", async () => {
	const actual = await vi.importActual("vue-router");
	return {
		...(actual as any),
		useRouter: vi.fn(),
		useRoute: vi.fn(),
	};
});

const { useRouter, useRoute } = vueRouter;

const i18n = createI18n({
	legacy: false,
	locale: "en",
	messages: {
		en: {
			login: {
				title: "Login",
				description: "Enter your credentials to login",
				form: {
					username: "Username",
					"username-placeholder": "Enter your username",
					password: "Password",
					"password-placeholder": "Enter your password",
					submit: "Login",
					loading: "Loading...",
					"validation.username-required": "Username is required",
					"validation.password-required": "Password is required",
					register: "Don't have an account?",
					"register-link": "Register",
				},
			},
		},
	},
});

describe("Login.vue", () => {
	it("should render the component", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, createTestingPinia()],
			},
		});

		expect(wrapper.find("form").exists()).toBe(true);
	});

	it("should show validation errors for empty fields", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, createTestingPinia()],
			},
		});

		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(wrapper.findAll('[data-slot="form-message"]').length).toBe(2);
			expect(wrapper.findAll(".text-destructive-foreground").length).toBe(2);
		});
	});

	it("should call the auth store login method on form submission", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

		const pinia = createTestingPinia({
			createspy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await vi.waitFor(() => {
			expect(authStore.login).toHaveBeenCalledWith("user", "password");
		});
	});

	it("should show an error message on invalid credentials", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

		const pinia = createTestingPinia({
			createspy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi
			.fn()
			.mockRejectedValue(new Error("Invalid credentials"));

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await vi.waitFor(() => {
			expect(wrapper.find("#error-message").exists()).toBe(true);
			expect(wrapper.find("#error-message").text()).toBe(
				"Invalid credentials. Please try again.",
			);
		});
	});

	it("should redirect to the home page on successful login", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

		const pinia = createTestingPinia({
			createspy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/");
		});
	});

	it("should redirect to the given valid redirect path on successful login", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({
			query: { redirect: "/dashboard" },
		} as any);

		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/dashboard");
		});
	});

	it("should redirect to the home page on successful login with an invalid redirect path", async () => {
		const push = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as any);
		vi.mocked(useRoute).mockReturnValue({
			query: { redirect: "../invalid" },
		} as any);

		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const wrapper = mount(Login, {
			global: {
				plugins: [i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/");
		});
	});
});
