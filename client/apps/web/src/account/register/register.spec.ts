import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import {
	describe,
	expect,
	it,
	vi,
	beforeEach,
	afterEach,
	type Mock,
} from "vitest";
import Register from "./register.vue";
import { useAuthStore }d from "@/stores/auth";

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
		const wrapper = shallowMount(Register);
		const form = wrapper.vm.form;
		const errors = wrapper.vm.errors;

		form.firstName = "J";
		await wrapper.vm.validateField("firstName");
		expect(errors.firstName).toBe("First name must be at least 2 characters.");

		form.firstName = "John";
		await wrapper.vm.validateField("firstName");
		expect(errors.firstName).toBe("");

		form.password = "password";
		await wrapper.vm.validateField("password");
		expect(errors.password).not.toBe("");

		form.password = "Password123!";
		await wrapper.vm.validateField("password");
		expect(errors.password).toBe("");

		form.confirmPassword = "password";
		await wrapper.vm.validateField("confirmPassword");
		expect(errors.confirmPassword).toBe("Passwords do not match.");

		form.confirmPassword = "Password123!";
		await wrapper.vm.validateField("confirmPassword");
		expect(errors.confirmPassword).toBe("");
	});

	it("should call authStore.register on valid form submission", async () => {
		const authStore = useAuthStore();
		authStore.register = vi.fn();
		const wrapper = shallowMount(Register);
		const form = wrapper.vm.form;

		form.firstName = "John";
		form.lastName = "Doe";
		form.username = "johndoe";
		form.email = "john.doe@example.com";
		form.password = "Password123!";
		form.confirmPassword = "Password123!";

		await wrapper.vm.handleRegister();

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
		const wrapper = shallowMount(Register);
		const { toast } = await import("vue-sonner");

		wrapper.vm.form.firstName = "John";
		wrapper.vm.form.lastName = "Doe";
		wrapper.vm.form.username = "johndoe";
		wrapper.vm.form.email = "john.doe@example.com";
		wrapper.vm.form.password = "Password123!";
		wrapper.vm.form.confirmPassword = "Password123!";

		await wrapper.vm.handleRegister();

		expect(toast.success).toHaveBeenCalledWith(
			"Account created successfully!",
			expect.any(Object),
		);
	});

	it("should show error toast on failed registration", async () => {
		const authStore = useAuthStore();
		authStore.register = vi.fn().mockRejectedValue(new Error());
		const wrapper = shallowMount(Register);
		const { toast } = await import("vue-sonner");

		wrapper.vm.form.firstName = "John";
		wrapper.vm.form.lastName = "Doe";
		wrapper.vm.form.username = "johndoe";
		wrapper.vm.form.email = "john.doe@example.com";
		wrapper.vm.form.password = "Password123!";
		wrapper.vm.form.confirmPassword = "Password123!";

		await wrapper.vm.handleRegister();

		expect(toast.error).toHaveBeenCalledWith(
			"Registration failed",
			expect.any(Object),
		);
	});
});
