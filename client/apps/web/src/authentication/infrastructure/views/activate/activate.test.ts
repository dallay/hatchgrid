import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import * as activateModule from "../../../application/activate";
import { AuthenticationError } from "../../../domain/errors";
import ActivateView from "./activate.vue";

// Mock the activate use case
vi.mock("../../../application/activate", () => ({
	activateAccount: vi.fn(),
}));

const mockActivateAccount = vi.mocked(activateModule.activateAccount);

function createTestRouter() {
	return createRouter({
		history: createWebHistory(),
		routes: [
			{ path: "/activate", component: ActivateView },
			{ path: "/login", component: { template: "<div>Login</div>" } },
			{ path: "/", component: { template: "<div>Home</div>" } },
		],
	});
}

describe("ActivateView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should show loading state initially", async () => {
		const router = createTestRouter();
		// Setup
		router.push("/activate?key=test-key");
		await router.isReady();

		mockActivateAccount.mockImplementation(() => new Promise(() => {})); // Never resolves

		// Mount component
		const wrapper = mount(ActivateView, {
			global: {
				plugins: [router],
			},
		});

		// Assert
		expect(wrapper.text()).toContain("Activating your account...");
		expect(wrapper.find(".animate-spin").exists()).toBe(true);
	});

	it("should show success state when activation succeeds", async () => {
		const router = createTestRouter();
		// Setup
		router.push("/activate?key=valid-key");
		await router.isReady();

		mockActivateAccount.mockResolvedValue();

		// Mount component
		const wrapper = mount(ActivateView, {
			global: {
				plugins: [router],
			},
		});

		// Wait for activation to complete
		await vi.waitFor(() => {
			expect(wrapper.text()).toContain(
				"Your account has been successfully activated!",
			);
		});

		// Assert
		expect(wrapper.text()).toContain(
			"✓ Your account has been successfully activated!",
		);
		expect(wrapper.find('a[href="/login"]').exists()).toBe(true);
		expect(mockActivateAccount).toHaveBeenCalledWith("valid-key");
	});

	it("should show error state when activation fails", async () => {
		const router = createTestRouter();
		// Setup
		router.push("/activate?key=invalid-key");
		await router.isReady();

		const error = new AuthenticationError(
			"Invalid activation key",
			"INVALID_KEY",
		);
		mockActivateAccount.mockRejectedValue(error);

		// Mount component
		const wrapper = mount(ActivateView, {
			global: {
				plugins: [router],
			},
		});

		// Wait for activation to fail
		await vi.waitFor(() => {
			expect(wrapper.text()).toContain("Account activation failed");
		});

		// Assert
		expect(wrapper.text()).toContain("✗ Account activation failed");
		expect(wrapper.text()).toContain("Invalid activation key");
		expect(wrapper.find('a[href="/"]').exists()).toBe(true);
		expect(mockActivateAccount).toHaveBeenCalledWith("invalid-key");
	});

	it("should show error when activation key is missing", async () => {
		const router = createTestRouter();
		// Setup
		router.push("/activate"); // No key parameter
		await router.isReady();

		// Mount component
		const wrapper = mount(ActivateView, {
			global: {
				plugins: [router],
			},
		});

		// Wait for error to show
		await vi.waitFor(() => {
			expect(wrapper.text()).toContain("Account activation failed");
		});

		// Assert
		expect(wrapper.text()).toContain("Activation key is missing from the URL");
		expect(mockActivateAccount).not.toHaveBeenCalled();
	});

	it("should have proper accessibility attributes", async () => {
		const router = createTestRouter();
		// Setup
		router.push("/activate?key=test-key");
		await router.isReady();

		mockActivateAccount.mockResolvedValue();

		// Mount component
		const wrapper = mount(ActivateView, {
			global: {
				plugins: [router],
			},
		});

		// Wait for success state
		await vi.waitFor(() => {
			expect(wrapper.text()).toContain(
				"Your account has been successfully activated!",
			);
		});

		// Assert accessibility attributes
		const successAlert = wrapper.find('[role="alert"][aria-live="polite"]');
		expect(successAlert.exists()).toBe(true);
		expect(mockActivateAccount).toHaveBeenCalledWith("test-key");
	});
});
