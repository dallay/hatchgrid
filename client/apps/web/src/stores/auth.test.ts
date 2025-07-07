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
		mock
			.onGet("/api/account")
			.reply(200, { login: "testuser", authorities: ["ROLE_USER"] });

		await authStore.login("testuser", "password");
		expect(authStore.isAuthenticated).toBe(true);
		expect(authStore.account?.login).toBe("testuser");
	});

	it("should set isAuthenticated to false on failed login", async () => {
		const authStore = useAuthStore();
		mock.onPost("/api/login").reply(401);

		await expect(authStore.login("wronguser", "wrongpass")).rejects.toThrow(
			"Invalid credentials.",
		);
		expect(authStore.isAuthenticated).toBe(false);
	});

	it("should clear account on successful logout", async () => {
		const authStore = useAuthStore();
		// Simulate being logged in
		authStore.userIdentity = { login: "testuser", authorities: ["ROLE_USER"] };
		authStore.authenticated = true;
		mock.onPost("/api/logout").reply(200);

		await authStore.logoutAsync();
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.account).toBeNull();
	});

	it("should clear account even if logout fails on the server", async () => {
		const authStore = useAuthStore();
		// Simulate being logged in
		authStore.userIdentity = { login: "testuser", authorities: ["ROLE_USER"] };
		authStore.authenticated = true;
		mock.onPost("/api/logout").reply(500);

		// The action should not reject because logoutAsync handles the error
		await authStore.logoutAsync();

		// The account should be cleared on the client-side regardless
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.account).toBeNull();
	});
});
