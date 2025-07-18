import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, it, vi, expect} from "vitest";
import { useAuthStore } from "@/stores/auth";
import { createI18n } from "vue-i18n";
import { createRouter, createWebHistory } from "vue-router";
import Login from "./login.vue";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/login",
			name: "login",
			component: Login,
		},
		{
			path: "/",
			name: "home",
			component: { template: "<div>Home</div>" },
		},
	],
});

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
	it("should render the component", () => {
		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, createTestingPinia()],
			},
		});
		expect(wrapper.find("h1").text()).toBe("Login");
	});

	it("should show validation errors for empty fields", async () => {
		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, createTestingPinia()],
			},
		});

		await wrapper.find("form").trigger("submit.prevent");

		expect(wrapper.findAll(".text-red-600").length).toBe(2);
	});

	it("should call the auth store login method on form submission", async () => {
		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);

		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");

		expect(authStore.login).toHaveBeenCalledWith("user", "password");
	});

	it("should show an error message on invalid credentials", async () => {
		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockRejectedValue(new Error("Invalid credentials"));

		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");

		await wrapper.vm.$nextTick();

		expect(wrapper.find("#error-message").text()).toBe(
			"Invalid credentials. Please try again.",
		);
	});

	it("should redirect to the home page on successful login", async () => {
		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const push = vi.fn();
		router.push = push;

		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");

		await wrapper.vm.$nextTick();

		expect(push).toHaveBeenCalledWith("/");
	});

	it("should redirect to the given valid redirect path on successful login", async () => {
		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const push = vi.fn();
		router.push = push;
		router.currentRoute.value.query.redirect = "/dashboard";

		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");

		await wrapper.vm.$nextTick();

		expect(push).toHaveBeenCalledWith("/dashboard");
	});

	it("should redirect to the home page on successful login with an invalid redirect path", async () => {
		const pinia = createTestingPinia({
			createSpy: vi.fn,
		});
		const authStore = useAuthStore(pinia);
		authStore.login = vi.fn().mockResolvedValue(undefined);

		const push = vi.fn();
		router.push = push;
		router.currentRoute.value.query.redirect = "/invalid-path";

		const wrapper = mount(Login, {
			global: {
				plugins: [router, i18n, pinia],
			},
		});

		await wrapper.find('input[type="text"]').setValue("user");
		await wrapper.find('input[type="password"]').setValue("password");
		await wrapper.find("form").trigger("submit.prevent");

		await wrapper.vm.$nextTick();

		expect(push).toHaveBeenCalledWith("/");
	});
});
