/**
 * @vitest-environment jsdom
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Router } from "vue-router";
import { setupAxiosInterceptors } from "./axios-interceptor";

// Mock the auth store
const mockLogout = vi.fn();
vi.mock("@/stores/auth", () => ({
	useAuthStore: vi.fn(() => ({
		logout: mockLogout,
	})),
}));

describe("Axios Interceptor", () => {
	let mock: MockAdapter;
	let router: Router;

	beforeEach(() => {
		setActivePinia(createPinia());
		mock = new MockAdapter(axios);
		// Patch: Provide a mock currentRoute for router
		// Provide only the methods/properties needed for the test, cast as unknown as Router
		// Use a minimal mock type to avoid 'any' and type errors
		type MinimalRoute = { name?: string; fullPath?: string };
		type MinimalRouter = Router & { currentRoute: { value: MinimalRoute } };
		router = {
			push: vi.fn(),
			currentRoute: {
				value: { name: undefined, fullPath: undefined },
			},
		} as unknown as MinimalRouter;
		setupAxiosInterceptors(router);
	});

	afterEach(() => {
		mock.reset();
		vi.clearAllMocks();
	});

	it("should redirect to /login on 401 error", async () => {
		mock.onGet("/api/test").reply(401);
		// Set current route to something other than Login
		(
			router as {
				currentRoute: { value: { name?: string; fullPath?: string } };
			}
		).currentRoute.value = { name: "Home", fullPath: "/" };

		await expect(axios.get("/api/test")).rejects.toThrow();

		expect(mockLogout).toHaveBeenCalled();
		expect(router.push).toHaveBeenCalledWith({
			name: "Login",
			query: { redirect: "/" },
		});
	});

	it("should redirect to /forbidden on 403 error", async () => {
		mock.onGet("/api/test").reply(403);
		// Set current route to something other than Forbidden
		(
			router as {
				currentRoute: { value: { name?: string; fullPath?: string } };
			}
		).currentRoute.value = { name: "Home", fullPath: "/" };

		await expect(axios.get("/api/test")).rejects.toThrow();

		expect(mockLogout).not.toHaveBeenCalled();
		expect(router.push).toHaveBeenCalledWith({ name: "Forbidden" });
	});

	it("should not redirect for other error codes", async () => {
		mock.onGet("/api/test").reply(500);

		await expect(axios.get("/api/test")).rejects.toThrow();

		expect(mockLogout).not.toHaveBeenCalled();
		expect(router.push).not.toHaveBeenCalled();
	});
});
