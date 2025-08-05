/**
 * Unit tests for dependency injection initialization
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubscriberStore } from "@/subscribers";
import { createUseCases } from "@/subscribers/di";
import {
	configureStoreFactory,
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
	// Mock store type to match the expected interface
	let mockStore: {
		initializeStore: ReturnType<typeof vi.fn>;
		fetchSubscribers: ReturnType<typeof vi.fn>;
		countByStatus: ReturnType<typeof vi.fn>;
		countByTags: ReturnType<typeof vi.fn>;
		resetState: ReturnType<typeof vi.fn>;
		clearError: ReturnType<typeof vi.fn>;
		fetchAllData: ReturnType<typeof vi.fn>;
		refreshData: ReturnType<typeof vi.fn>;
		getStatusCount: ReturnType<typeof vi.fn>;
		getTagCount: ReturnType<typeof vi.fn>;
		getTopTags: ReturnType<typeof vi.fn>;
		// State properties
		subscribers: unknown[];
		statusCounts: unknown[];
		tagCounts: unknown[];
		loading: {
			fetchingSubscribers: boolean;
			countingByStatus: boolean;
			countingByTags: boolean;
		};
		error: null;
		lastFetchFilters: null;
		// Computed properties
		isLoading: boolean;
		hasError: boolean;
		subscriberCount: number;
		totalStatusCount: number;
		totalTagCount: number;
		isAnyDataLoaded: boolean;
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		resetInitialization();
		vi.clearAllMocks();

		// Create mock store with all required properties
		mockStore = {
			initializeStore: vi.fn(),
			fetchSubscribers: vi.fn(),
			countByStatus: vi.fn(),
			countByTags: vi.fn(),
			resetState: vi.fn(),
			clearError: vi.fn(),
			fetchAllData: vi.fn(),
			refreshData: vi.fn(),
			getStatusCount: vi.fn(),
			getTagCount: vi.fn(),
			getTopTags: vi.fn(),
			// State properties
			subscribers: [],
			statusCounts: [],
			tagCounts: [],
			loading: {
				fetchingSubscribers: false,
				countingByStatus: false,
				countingByTags: false,
			},
			error: null,
			lastFetchFilters: null,
			// Computed properties
			isLoading: false,
			hasError: false,
			subscriberCount: 0,
			totalStatusCount: 0,
			totalTagCount: 0,
			isAnyDataLoaded: false,
		};

		// Configure store factory to return mock store
		configureStoreFactory(() => mockStore as unknown as SubscriberStore);
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
			// Verify initializeStore was called with use cases
			expect(mockStore.initializeStore).toHaveBeenCalledTimes(1);
			expect(mockStore.initializeStore).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchSubscribers: expect.objectContaining({
						execute: expect.any(Function),
					}),
					countByStatus: expect.objectContaining({
						execute: expect.any(Function),
					}),
					countByTags: expect.objectContaining({
						execute: expect.any(Function),
					}),
				}),
			);
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
			expect(store).toBe(mockStore);
			expect(typeof store.initializeStore).toBe("function");
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
	it("should handle createUseCases failure", () => {
		const mockCreateUseCases = vi.mocked(createUseCases);
		mockCreateUseCases.mockImplementationOnce(() => {
			throw new Error("Failed to create use cases");
		});

		expect(() => initializeSubscribersModule()).toThrow(
			"Failed to initialize subscribers module: Failed to create use cases",
		);
		expect(isSubscribersModuleInitialized()).toBe(false);
	});

	it("should handle concurrent initialization attempts", async () => {
		const promises = Array(5)
			.fill(null)
			.map(() =>
				Promise.resolve().then(() => safeInitializeSubscribersModule()),
			);

		await Promise.all(promises);

		// Should initialize only once despite concurrent attempts
		expect(isSubscribersModuleInitialized()).toBe(true);
		expect(vi.mocked(createUseCases)).toHaveBeenCalledTimes(1);
	});
});
