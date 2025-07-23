import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import type { Router } from "vue-router";
import * as vueRouter from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { createMockRouteLoaded } from "@/test-utils/route-mocks";
import Login from "./login.vue";

vi.mock("vue-router", async () => {
	const actual = await vi.importActual("vue-router");
	return {
		...actual,
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
	const createMockRouter = () => {
		const push: Router["push"] = vi.fn();
		vi.mocked(useRouter).mockReturnValue({ push } as Router);
		return { push };
	};

	const createWrapper = (routeOptions = {}) => {
		const { push } = createMockRouter();
		vi.mocked(useRoute).mockReturnValue(
			createMockRouteLoaded({
				path: "/login",
				query: {},
				...routeOptions,
			}),
		);

		return {
			wrapper: mount(Login, {
				global: {
					plugins: [i18n, createTestingPinia()],
				},
			}),
			push,
		};
	};

	const createWrapperWithAuthStore = (
		routeOptions = {},
		authStoreMock = {},
	) => {
		const { push } = createMockRouter();
		vi.mocked(useRoute).mockReturnValue(
			createMockRouteLoaded({
				path: "/login",
				query: {},
				...routeOptions,
			}),
		);

		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		Object.assign(authStore, authStoreMock);

		return {
			wrapper: mount(Login, {
				global: {
					plugins: [i18n, pinia],
				},
			}),
			push,
			authStore,
		};
	};

	it("should render the component", async () => {
		const { wrapper } = createWrapper();
		expect(wrapper.find("form").exists()).toBe(true);
	});

	it("should show validation errors for empty fields", async () => {
		const { wrapper } = createWrapper();

		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(wrapper.findAll('[data-slot="form-message"]').length).toBe(2);
			expect(wrapper.findAll(".text-destructive-foreground").length).toBe(2);
		});
	});

	it("should call the auth store login method on form submission", async () => {
		const { wrapper, authStore } = createWrapperWithAuthStore(
			{},
			{
				login: vi.fn().mockResolvedValue(undefined),
			},
		);

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(authStore.login).toHaveBeenCalledWith("user", "password");
		});
	});

	it("should show an error message on invalid credentials", async () => {
		const { wrapper } = createWrapperWithAuthStore(
			{},
			{
				login: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
			},
		);

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(wrapper.find("#error-message").exists()).toBe(true);
		});
	});

	it("should redirect to the home page on successful login", async () => {
		const { wrapper, push } = createWrapperWithAuthStore(
			{},
			{
				login: vi.fn().mockResolvedValue(undefined),
			},
		);

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/");
		});
	});

	it("should redirect to the given valid redirect path on successful login", async () => {
		const { wrapper, push } = createWrapperWithAuthStore(
			{ query: { redirect: "/dashboard" } },
			{ login: vi.fn().mockResolvedValue(undefined) },
		);

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/dashboard");
		});
	});

	it("should redirect to the home page on successful login with an invalid redirect path", async () => {
		const { wrapper, push } = createWrapperWithAuthStore(
			{ query: { redirect: "../invalid" } },
			{ login: vi.fn().mockResolvedValue(undefined) },
		);

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();

		await vi.waitFor(() => {
			expect(push).toHaveBeenCalledWith("/");
		});
	});
});
