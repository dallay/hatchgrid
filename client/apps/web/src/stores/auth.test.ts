import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./auth";

describe("Auth Store", () => {
	let mock: MockAdapter;

	beforeEach(() => {
		setActivePinia(createPinia());
		mock = new MockAdapter(axios);
	});

	it("should set isAuthenticated to true on successful login", async () => {
		const authStore = useAuthStore();
		mock.onPost("/api/login").reply(200);

		await authStore.login("testuser", "password");
		expect(authStore.isAuthenticated).toBe(true);
	});

	it("should set isAuthenticated to false on failed login", async () => {
		const authStore = useAuthStore();
		mock.onPost("/api/login").reply(401);

		await expect(authStore.login("wronguser", "wrongpass")).rejects.toThrow();
		expect(authStore.isAuthenticated).toBe(false);
	});

	it("should set isAuthenticated to true on successful session check", async () => {
		const authStore = useAuthStore();
		mock.onPost("/api/refresh-token").reply(200);

		const success = await authStore.checkSession();
		expect(success).toBe(true);
		expect(authStore.isAuthenticated).toBe(true);
	});

	it("should set isAuthenticated to false on failed session check", async () => {
		const authStore = useAuthStore();
		mock.onPost("/api/refresh-token").reply(401);

		await expect(authStore.checkSession()).rejects.toThrow();
		expect(authStore.isAuthenticated).toBe(false);
	});

	it("should set isAuthenticated to false on successful logout", async () => {
		const authStore = useAuthStore();
		authStore.isAuthenticated = true; // Simulate being logged in
		mock.onPost("/api/logout").reply(200);

		await authStore.logout();
		expect(authStore.isAuthenticated).toBe(false);
	});

	it("should handle logout failure gracefully", async () => {
		const authStore = useAuthStore();
		authStore.isAuthenticated = true; // Simulate being logged in
		mock.onPost("/api/logout").reply(500);

		await expect(authStore.logout()).rejects.toThrow();
		expect(authStore.isAuthenticated).toBe(true); // Should remain true if logout fails
	});
});
