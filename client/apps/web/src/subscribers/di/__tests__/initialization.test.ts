/**
 * Unit tests for dependency injection initialization
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscriberStore } from "../../store/subscriber.store";
import {
	getInitializedStore,
	initializeSubscribersModule,
	initializeWithOptions,
	isSubscribersModuleInitialized,
	resetInitialization,
	safeInitializeSubscribersModule,
} from "../initialization";

// Mock the container module
vi.mock("../container", () => ({
	createUseCases: vi.fn(() => ({
		fetchSubscribers: { execute: vi.fn() },
		countByStatus: { execute: vi.fn() },
		countByTags: { execute: vi.fn() },
	})),
}));

describe("Dependency Injection Initialization", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		resetInitialization();
		vi.clearAllMocks();
	});

	describe("initializeSubscribersModule", () => {
		it("should initialize the module successfully", () => {
			expect(isSubscribersModuleInitialized()).toBe(false);

			expect(() => initializeSubscribersModule()).not.toThrow();

			expect(isSubscribersModuleInitialized()).toBe(true);
		});

		it("should throw error when trying to initialize twice", () => {
			initializeSubscribersModule();

			expect(() => initializeSubscribersModule()).toThrow(
				"Subscribers module has already been initialized",
			);
		});

		it("should initialize the store with use cases", () => {
			initializeSubscribersModule();

			const store = useSubscriberStore();
			// The store should be initialized and not throw when accessing internal methods
			expect(() => store._internal.ensureInitialized()).not.toThrow();
		});
	});

	describe("safeInitializeSubscribersModule", () => {
		it("should initialize if not already initialized", () => {
			expect(isSubscribersModuleInitialized()).toBe(false);

			safeInitializeSubscribersModule();

			expect(isSubscribersModuleInitialized()).toBe(true);
		});

		it("should not throw if already initialized", () => {
			initializeSubscribersModule();

			expect(() => safeInitializeSubscribersModule()).not.toThrow();
			expect(isSubscribersModuleInitialized()).toBe(true);
		});
	});

	describe("getInitializedStore", () => {
		it("should return store after initialization", () => {
			initializeSubscribersModule();

			const store = getInitializedStore();

			expect(store).toBeDefined();
			expect(typeof store.fetchSubscribers).toBe("function");
		});

		it("should throw error if not initialized", () => {
			expect(() => getInitializedStore()).toThrow(
				"Subscribers module must be initialized before accessing the store",
			);
		});
	});

	describe("initializeWithOptions", () => {
		it("should call onSuccess callback on successful initialization", () => {
			const onSuccess = vi.fn();
			const onError = vi.fn();

			initializeWithOptions({ onSuccess, onError });

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it("should call onError callback on initialization failure", () => {
			// Force an error by initializing twice
			initializeSubscribersModule();

			const onSuccess = vi.fn();
			const onError = vi.fn();

			expect(() => initializeWithOptions({ onSuccess, onError })).toThrow();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});

		it("should skip initialization if already initialized and skipIfInitialized is true", () => {
			initializeSubscribersModule();

			const onSuccess = vi.fn();
			const onError = vi.fn();

			initializeWithOptions({
				skipIfInitialized: true,
				onSuccess,
				onError,
			});

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});
	});

	describe("resetInitialization", () => {
		it("should reset initialization state", () => {
			initializeSubscribersModule();
			expect(isSubscribersModuleInitialized()).toBe(true);

			resetInitialization();

			expect(isSubscribersModuleInitialized()).toBe(false);
		});
	});
});
