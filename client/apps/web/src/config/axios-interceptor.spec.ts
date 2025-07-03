/**
 * @vitest-environment jsdom
 */

import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as setupAxiosConfig from "./axios-interceptor";

declare const SERVER_API_URL: string;

const mock = new MockAdapter(axios);

describe("Axios interceptor", () => {
	beforeEach(() => {
		axios.interceptors.request.clear();
		axios.interceptors.response.clear();
		localStorage.clear();
		sessionStorage.clear();
		mock.reset();
	});

	afterEach(() => {
		mock.reset();
	});

	it("should use localStorage to provide bearer", () => {
		localStorage.setItem("jhi-authenticationToken", "auth");

		const mockConfig: InternalAxiosRequestConfig = {
			url: "/test",
			headers: {} as InternalAxiosRequestConfig["headers"],
			timeout: 0,
			method: "get",
		} as InternalAxiosRequestConfig;

		const result = setupAxiosConfig.onRequestSuccess(mockConfig);

		expect(result.headers.Authorization).toBe("Bearer auth");
		expect(result.url).toContain(SERVER_API_URL);
		expect(result.url).toContain("/test");
	});

	it("should use sessionStorage to provide bearer", () => {
		sessionStorage.setItem("jhi-authenticationToken", "auth");

		const mockConfig: InternalAxiosRequestConfig = {
			url: "/test",
			headers: {} as InternalAxiosRequestConfig["headers"],
			timeout: 0,
			method: "get",
		} as InternalAxiosRequestConfig;

		const result = setupAxiosConfig.onRequestSuccess(mockConfig);

		expect(result.headers.Authorization).toBe("Bearer auth");
		expect(result.url).toContain(SERVER_API_URL);
		expect(result.url).toContain("/test");
	});
});

describe("Axios errors interceptor", () => {
	beforeEach(() => {
		axios.interceptors.request.clear();
		axios.interceptors.response.clear();
		mock.reset();
	});

	afterEach(() => {
		mock.reset();
	});

	it("should use callback on 401, 403 errors", async () => {
		let callbackCalled = false;
		const callback = vi.fn().mockImplementation((err) => {
			callbackCalled = true;
			return Promise.reject(err);
		});
		const serverErrorCallback = vi
			.fn()
			.mockRejectedValue(new Error("Server Error"));

		setupAxiosConfig.setupAxiosInterceptors(callback, serverErrorCallback);

		// Match the full URL path that will be created by the interceptor
		mock.onGet("//api/test").reply(401);

		await expect(axios.get("/api/test")).rejects.toThrow();
		expect(callbackCalled).toBe(true);
		expect(callback).toHaveBeenCalled();
	});

	it("should use callback on 403 errors", async () => {
		let callbackCalled = false;
		const callback = vi.fn().mockImplementation((err) => {
			callbackCalled = true;
			return Promise.reject(err);
		});
		const serverErrorCallback = vi
			.fn()
			.mockRejectedValue(new Error("Server Error"));

		setupAxiosConfig.setupAxiosInterceptors(callback, serverErrorCallback);

		mock.onGet("//api/test").reply(403);

		await expect(axios.get("/api/test")).rejects.toThrow();
		expect(callbackCalled).toBe(true);
		expect(callback).toHaveBeenCalled();
	});

	it("should use callback 50x errors", async () => {
		let callbackCalled = false;
		const unauthCallback = vi.fn().mockRejectedValue(new Error("Unauthorized"));
		const callback = vi.fn().mockImplementation((err) => {
			callbackCalled = true;
			return Promise.reject(err);
		});

		setupAxiosConfig.setupAxiosInterceptors(unauthCallback, callback);

		mock.onGet("//api/test").reply(500);

		await expect(axios.get("/api/test")).rejects.toThrow();
		expect(callbackCalled).toBe(true);
		expect(callback).toHaveBeenCalled();
	});

	it("should not use callback for errors different 50x, 401, 403", async () => {
		const unauthCallback = vi.fn().mockRejectedValue(new Error("Unauthorized"));
		const serverErrorCallback = vi
			.fn()
			.mockRejectedValue(new Error("Server Error"));

		setupAxiosConfig.setupAxiosInterceptors(
			unauthCallback,
			serverErrorCallback,
		);

		mock.onGet("//api/test").reply(402);

		await expect(axios.get("/api/test")).rejects.toThrow();
		expect(unauthCallback).not.toHaveBeenCalled();
		expect(serverErrorCallback).not.toHaveBeenCalled();
	});
});
