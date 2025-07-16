import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";
import { useAuthStore } from "@/stores/auth";
import Register from "./register.vue";

vi.mock("vue-sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("vue-router", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
	RouterLink: {
		template: "<a><slot /></a>",
	},
}));

describe("Register.vue", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should validate the form correctly", async () => {
		const wrapper = mount(Register);

		await wrapper.find("#firstName").setValue("J");
		await wrapper.find("#firstName").trigger("input");
		expect(wrapper.html()).toContain(
			"First name must be at least 2 characters.",
		);

		await wrapper.find("#firstName").setValue("John");
		await wrapper.find("#firstName").trigger("input");
		expect(wrapper.html()).not.toContain(
			"First name must be at least 2 characters.",
		);

		await wrapper.find("#password").setValue("password");
		await wrapper.find("#password").trigger("input");
		expect(wrapper.html()).toContain("Password must be at least 8 characters.");

		await wrapper.find("#password").setValue("Password123!");
		await wrapper.find("#password").trigger("input");
		expect(wrapper.html()).not.toContain(
			"Password must be at least 8 characters.",
		);

		await wrapper.find("#confirmPassword").setValue("password");
		await wrapper.find("#confirmPassword").trigger("input");
		expect(wrapper.html()).toContain("Passwords do not match.");

		await wrapper.find("#confirmPassword").setValue("Password123!");
		await wrapper.find("#confirmPassword").trigger("input");
		expect(wrapper.html()).not.toContain("Passwords do not match.");
	});

	it("should call authStore.register on valid form submission", async () => {
		const authStore = useAuthStore();
		authStore.register = vi.fn();
		const wrapper = mount(Register);

		await wrapper.find("#firstName").setValue("John");
		await wrapper.find("#lastName").setValue("Doe");
		await wrapper.find("#username").setValue("johndoe");
		await wrapper.find("#email").setValue("john.doe@example.com");
		await wrapper.find("#password").setValue("Password123!");
		await wrapper.find("#confirmPassword").setValue("Password123!");

		await wrapper.find("form").trigger("submit.prevent");

		expect(authStore.register).toHaveBeenCalledWith({
			email: "john.doe@example.com",
			password: "Password123!",
			firstName: "John",
			lastName: "Doe",
			username: "johndoe",
		});
	});

	it("should show success toast on successful registration", async () => {
		const authStore = useAuthStore();
		authStore.register = vi.fn().mockResolvedValue(undefined);
		const wrapper = mount(Register);

		await wrapper.find("#firstName").setValue("John");
		await wrapper.find("#lastName").setValue("Doe");
		await wrapper.find("#username").setValue("johndoe");
		await wrapper.find("#email").setValue("john.doe@example.com");
		await wrapper.find("#password").setValue("Password123!");
		await wrapper.find("#confirmPassword").setValue("Password123!");

		await wrapper.find("form").trigger("submit.prevent");

		expect(toast.success).toHaveBeenCalledWith(
			"Account created successfully!",
			expect.any(Object),
		);
	});

	it("should show error toast on failed registration", async () => {
		const authStore = useAuthStore();
		authStore.register = vi.fn().mockRejectedValue(new Error());
		const wrapper = mount(Register);

		await wrapper.find("#firstName").setValue("John");
		await wrapper.find("#lastName").setValue("Doe");
		await wrapper.find("#username").setValue("johndoe");
		await wrapper.find("#email").setValue("john.doe@example.com");
		await wrapper.find("#password").setValue("Password123!");
		await wrapper.find("#confirmPassword").setValue("Password123!");

		await wrapper.find("form").trigger("submit.prevent");

		expect(toast.error).toHaveBeenCalledWith(
			"Registration failed",
			expect.any(Object),
		);
	});
});
