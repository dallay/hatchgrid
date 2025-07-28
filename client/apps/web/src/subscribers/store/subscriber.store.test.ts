/**
 * Unit tests for subscriber store
 * Tests store actions with mocked use case dependencies
 */

import { createPinia, setActivePinia } from "pinia";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockedFunction,
	vi,
} from "vitest";
import { nextTick } from "vue";
import {
	type CountByStatusResponse,
	type CountByTagsResponse,
	type Subscriber,
	SubscriberStatus,
	type SubscriberUseCases,
	useSubscriberStore,
} from "@/subscribers";
import type {
	CountByStatus,
	CountByTags,
	FetchSubscribers,
	FetchSubscribersFilters,
} from "../domain/usecases";

// Mock data
const mockSubscribers: Subscriber[] = [
	{
		id: "1",
		email: "user1@example.com",
		name: "User One",
		status: SubscriberStatus.ENABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		email: "user2@example.com",
		name: "User Two",
		status: SubscriberStatus.DISABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
	},
];

const mockStatusCounts: CountByStatusResponse[] = [
	{ status: SubscriberStatus.ENABLED, count: 1 },
	{ status: SubscriberStatus.DISABLED, count: 1 },
	{ status: SubscriberStatus.BLOCKLISTED, count: 0 },
];

const mockTagCounts: CountByTagsResponse[] = [
	{ tag: "premium", count: 5 },
	{ tag: "newsletter", count: 3 },
	{ tag: "beta", count: 1 },
];

// Mock use cases
const createMockUseCases = (): SubscriberUseCases => ({
	fetchSubscribers: {
		execute: vi.fn(),
	} as unknown as FetchSubscribers,
	countByStatus: {
		execute: vi.fn(),
		getCountForStatus: vi.fn(),
	} as unknown as CountByStatus,
	countByTags: {
		execute: vi.fn(),
		getCountForTag: vi.fn(),
		getTopTags: vi.fn(),
	} as unknown as CountByTags,
});

describe("Subscriber Store", () => {
	let mockUseCases: SubscriberUseCases;
	let store: ReturnType<typeof useSubscriberStore>;

	beforeEach(() => {
		setActivePinia(createPinia());
		mockUseCases = createMockUseCases();
		store = useSubscriberStore();
		store.initializeStore(mockUseCases);
	});

	describe("Initialization", () => {
		it("should initialize with default state", () => {
			const freshStore = useSubscriberStore();

			expect(freshStore.subscribers).toEqual([]);
			expect(freshStore.statusCounts).toEqual([]);
			expect(freshStore.tagCounts).toEqual([]);
			expect(freshStore.loading.fetchingSubscribers).toBe(false);
			expect(freshStore.loading.countingByStatus).toBe(false);
			expect(freshStore.loading.countingByTags).toBe(false);
			expect(freshStore.error).toBeNull();
			expect(freshStore.lastFetchFilters).toBeNull();
		});

		it("should throw error when trying to use store before initialization", () => {
			// Create a fresh Pinia instance for this test to avoid shared state
			setActivePinia(createPinia());
			const uninitializedStore = useSubscriberStore();

			expect(() => {
				uninitializedStore._internal.ensureInitialized();
			}).toThrow("Store must be initialized with use cases before use");
		});

		it("should throw error when trying to initialize twice", () => {
			expect(() => store.initializeStore(mockUseCases)).toThrow(
				"Store has already been initialized",
			);
		});
	});

	describe("Computed Properties", () => {
		it("should calculate isLoading correctly", async () => {
			expect(store.isLoading).toBe(false);

			// Mock a long-running operation
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockImplementation(
				() => new Promise((resolve) => setTimeout(resolve, 100)),
			);

			const promise = store.fetchSubscribers(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			await nextTick();

			expect(store.isLoading).toBe(true);

			await promise;
			expect(store.isLoading).toBe(false);
		});

		it("should calculate hasError correctly", () => {
			expect(store.hasError).toBe(false);

			store._internal.errorUtils.set(
				store._internal.errorUtils.create("Test error"),
			);
			expect(store.hasError).toBe(true);

			store.clearError();
			expect(store.hasError).toBe(false);
		});

		it("should calculate subscriberCount correctly", async () => {
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockResolvedValue(mockSubscribers);

			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(store.subscriberCount).toBe(2);
		});

		it("should calculate totalStatusCount correctly", async () => {
			const mockExecute = mockUseCases.countByStatus.execute as MockedFunction<
				CountByStatus["execute"]
			>;
			mockExecute.mockResolvedValue(mockStatusCounts);

			await store.countByStatus("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(store.totalStatusCount).toBe(2);
		});

		it("should calculate totalTagCount correctly", async () => {
			const mockExecute = mockUseCases.countByTags.execute as MockedFunction<
				CountByTags["execute"]
			>;
			mockExecute.mockResolvedValue(mockTagCounts);

			await store.countByTags("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(store.totalTagCount).toBe(9);
		});
	});

	describe("fetchSubscribers", () => {
		it("should fetch subscribers successfully", async () => {
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockResolvedValue(mockSubscribers);

			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(mockExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				undefined,
			);
			expect(store.subscribers).toEqual(mockSubscribers);
			expect(store.error).toBeNull();
			expect(store.loading.fetchingSubscribers).toBe(false);
		});

		it("should fetch subscribers with filters", async () => {
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockResolvedValue(mockSubscribers);

			const filters: FetchSubscribersFilters = {
				status: "ENABLED",
				email: "test",
			};
			await store.fetchSubscribers(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);

			expect(mockExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);
			expect(store.lastFetchFilters).toEqual(filters);
		});

		it("should handle fetch error", async () => {
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockRejectedValue(new Error("Fetch failed"));

			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(store.subscribers).toEqual([]);
			expect(store.error?.message).toBe("Fetch failed");
			expect(store.error?.code).toBe("FETCH_SUBSCRIBERS_ERROR");
			expect(store.loading.fetchingSubscribers).toBe(false);
		});

		it("should handle invalid workspace ID", async () => {
			await store.fetchSubscribers("");

			expect(store.error?.message).toBe("Workspace ID is required");
			expect(store.error?.code).toBe("INVALID_WORKSPACE_ID");
			expect(mockUseCases.fetchSubscribers.execute).not.toHaveBeenCalled();
		});

		it("should set loading state during fetch", async () => {
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockImplementation(() => {
				expect(store.loading.fetchingSubscribers).toBe(true);
				return Promise.resolve(mockSubscribers);
			});

			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(store.loading.fetchingSubscribers).toBe(false);
		});
	});

	describe("countByStatus", () => {
		it("should count by status successfully", async () => {
			const mockExecute = mockUseCases.countByStatus.execute as MockedFunction<
				CountByStatus["execute"]
			>;
			mockExecute.mockResolvedValue(mockStatusCounts);

			await store.countByStatus("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(mockExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			expect(store.statusCounts).toEqual(mockStatusCounts);
			expect(store.error).toBeNull();
			expect(store.loading.countingByStatus).toBe(false);
		});

		it("should handle count by status error", async () => {
			const mockExecute = mockUseCases.countByStatus.execute as MockedFunction<
				CountByStatus["execute"]
			>;
			mockExecute.mockRejectedValue(new Error("Count failed"));

			await store.countByStatus("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(store.statusCounts).toEqual([]);
			expect(store.error?.message).toBe("Count failed");
			expect(store.error?.code).toBe("COUNT_BY_STATUS_ERROR");
		});

		it("should handle invalid workspace ID", async () => {
			await store.countByStatus("");

			expect(store.error?.message).toBe("Workspace ID is required");
			expect(store.error?.code).toBe("INVALID_WORKSPACE_ID");
			expect(mockUseCases.countByStatus.execute).not.toHaveBeenCalled();
		});
	});

	describe("countByTags", () => {
		it("should count by tags successfully", async () => {
			const mockExecute = mockUseCases.countByTags.execute as MockedFunction<
				CountByTags["execute"]
			>;
			mockExecute.mockResolvedValue(mockTagCounts);

			await store.countByTags("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(mockExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			expect(store.tagCounts).toEqual(mockTagCounts);
			expect(store.error).toBeNull();
			expect(store.loading.countingByTags).toBe(false);
		});

		it("should handle count by tags error", async () => {
			const mockExecute = mockUseCases.countByTags.execute as MockedFunction<
				CountByTags["execute"]
			>;
			mockExecute.mockRejectedValue(new Error("Count failed"));

			await store.countByTags("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(store.tagCounts).toEqual([]);
			expect(store.error?.message).toBe("Count failed");
			expect(store.error?.code).toBe("COUNT_BY_TAGS_ERROR");
		});

		it("should handle invalid workspace ID", async () => {
			await store.countByTags("");

			expect(store.error?.message).toBe("Workspace ID is required");
			expect(store.error?.code).toBe("INVALID_WORKSPACE_ID");
			expect(mockUseCases.countByTags.execute).not.toHaveBeenCalled();
		});
	});

	describe("fetchAllData", () => {
		it("should fetch all data concurrently", async () => {
			const mockFetchExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			const mockStatusExecute = mockUseCases.countByStatus
				.execute as MockedFunction<CountByStatus["execute"]>;
			const mockTagsExecute = mockUseCases.countByTags
				.execute as MockedFunction<CountByTags["execute"]>;

			mockFetchExecute.mockResolvedValue(mockSubscribers);
			mockStatusExecute.mockResolvedValue(mockStatusCounts);
			mockTagsExecute.mockResolvedValue(mockTagCounts);

			const filters: FetchSubscribersFilters = { status: "ENABLED" };
			await store.fetchAllData("d2054881-b8c1-4bfa-93ce-a0e94d003ead", filters);

			expect(mockFetchExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);
			expect(mockStatusExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			expect(mockTagsExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);

			expect(store.subscribers).toEqual(mockSubscribers);
			expect(store.statusCounts).toEqual(mockStatusCounts);
			expect(store.tagCounts).toEqual(mockTagCounts);
		});

		it("should handle partial failures gracefully", async () => {
			const mockFetchExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			const mockStatusExecute = mockUseCases.countByStatus
				.execute as MockedFunction<CountByStatus["execute"]>;
			const mockTagsExecute = mockUseCases.countByTags
				.execute as MockedFunction<CountByTags["execute"]>;

			mockFetchExecute.mockResolvedValue(mockSubscribers);
			mockStatusExecute.mockRejectedValue(new Error("Status count failed"));
			mockTagsExecute.mockResolvedValue(mockTagCounts);

			await store.fetchAllData("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Should have successful data
			expect(store.subscribers).toEqual(mockSubscribers);
			expect(store.tagCounts).toEqual(mockTagCounts);

			// Should have empty data for failed operation
			expect(store.statusCounts).toEqual([]);
		});

		it("should handle invalid workspace ID in fetchAllData", async () => {
			await expect(store.fetchAllData("")).rejects.toThrow("Workspace ID is required");

			expect(mockUseCases.fetchSubscribers.execute).not.toHaveBeenCalled();
			expect(mockUseCases.countByStatus.execute).not.toHaveBeenCalled();
			expect(mockUseCases.countByTags.execute).not.toHaveBeenCalled();
		});
	});

	describe("refreshData", () => {
		it("should refresh data with last filters", async () => {
			const mockFetchExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			const mockStatusExecute = mockUseCases.countByStatus
				.execute as MockedFunction<CountByStatus["execute"]>;
			const mockTagsExecute = mockUseCases.countByTags
				.execute as MockedFunction<CountByTags["execute"]>;

			mockFetchExecute.mockResolvedValue(mockSubscribers);
			mockStatusExecute.mockResolvedValue(mockStatusCounts);
			mockTagsExecute.mockResolvedValue(mockTagCounts);

			// Set last filters
			const filters: FetchSubscribersFilters = { status: "ENABLED" };
			await store.fetchSubscribers(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);

			// Clear mocks to test refresh
			vi.clearAllMocks();

			await store.refreshData("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(mockFetchExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);
			expect(mockStatusExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			expect(mockTagsExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
		});

		it("should refresh data without filters when none were used", async () => {
			const mockFetchExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			const mockStatusExecute = mockUseCases.countByStatus
				.execute as MockedFunction<CountByStatus["execute"]>;
			const mockTagsExecute = mockUseCases.countByTags
				.execute as MockedFunction<CountByTags["execute"]>;

			mockFetchExecute.mockResolvedValue(mockSubscribers);
			mockStatusExecute.mockResolvedValue(mockStatusCounts);
			mockTagsExecute.mockResolvedValue(mockTagCounts);

			await store.refreshData("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			expect(mockFetchExecute).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				undefined,
			);
		});
	});

	describe("Convenience Methods", () => {
		it("should get status count", async () => {
			const mockGetCount = mockUseCases.countByStatus
				.getCountForStatus as MockedFunction<
				CountByStatus["getCountForStatus"]
			>;
			mockGetCount.mockResolvedValue(5);

			const result = await store.getStatusCount(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				SubscriberStatus.ENABLED,
			);

			expect(mockGetCount).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				SubscriberStatus.ENABLED,
			);
			expect(result).toBe(5);
		});

		it("should handle status count error", async () => {
			const mockGetCount = mockUseCases.countByStatus
				.getCountForStatus as MockedFunction<
				CountByStatus["getCountForStatus"]
			>;
			mockGetCount.mockRejectedValue(new Error("Count failed"));

			const result = await store.getStatusCount(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				SubscriberStatus.ENABLED,
			);

			expect(result).toBe(0);
			expect(store.error?.code).toBe("GET_STATUS_COUNT_ERROR");
		});

		it("should get tag count", async () => {
			const mockGetCount = mockUseCases.countByTags
				.getCountForTag as MockedFunction<CountByTags["getCountForTag"]>;
			mockGetCount.mockResolvedValue(3);

			const result = await store.getTagCount(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				"premium",
			);

			expect(mockGetCount).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				"premium",
			);
			expect(result).toBe(3);
		});

		it("should handle tag count error", async () => {
			const mockGetCount = mockUseCases.countByTags
				.getCountForTag as MockedFunction<CountByTags["getCountForTag"]>;
			mockGetCount.mockRejectedValue(new Error("Count failed"));

			const result = await store.getTagCount(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				"premium",
			);

			expect(result).toBe(0);
			expect(store.error?.code).toBe("GET_TAG_COUNT_ERROR");
		});

		it("should get top tags", async () => {
			const mockGetTopTags = mockUseCases.countByTags
				.getTopTags as MockedFunction<CountByTags["getTopTags"]>;
			mockGetTopTags.mockResolvedValue(mockTagCounts.slice(0, 2));

			const result = await store.getTopTags(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				2,
			);

			expect(mockGetTopTags).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				2,
			);
			expect(result).toEqual(mockTagCounts.slice(0, 2));
		});

		it("should handle top tags error", async () => {
			const mockGetTopTags = mockUseCases.countByTags
				.getTopTags as MockedFunction<CountByTags["getTopTags"]>;
			mockGetTopTags.mockRejectedValue(new Error("Get top tags failed"));

			const result = await store.getTopTags(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);

			expect(result).toEqual([]);
			expect(store.error?.code).toBe("GET_TOP_TAGS_ERROR");
		});
	});

	describe("State Management", () => {
		it("should reset state", async () => {
			// Set some state
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockResolvedValue(mockSubscribers);
			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead", {
				status: "ENABLED",
			});

			// Verify state is set
			expect(store.subscribers).toEqual(mockSubscribers);
			expect(store.lastFetchFilters).toEqual({ status: "ENABLED" });

			// Reset state
			store.resetState();

			// Verify state is reset
			expect(store.subscribers).toEqual([]);
			expect(store.statusCounts).toEqual([]);
			expect(store.tagCounts).toEqual([]);
			expect(store.error).toBeNull();
			expect(store.lastFetchFilters).toBeNull();
			expect(store.loading.fetchingSubscribers).toBe(false);
			expect(store.loading.countingByStatus).toBe(false);
			expect(store.loading.countingByTags).toBe(false);
		});

		it("should clear error", () => {
			store._internal.errorUtils.set(
				store._internal.errorUtils.create("Test error"),
			);
			expect(store.hasError).toBe(true);

			store.clearError();
			expect(store.hasError).toBe(false);
			expect(store.error).toBeNull();
		});
	});

	describe("Error Handling", () => {
		it("should create error with timestamp", () => {
			const error = store._internal.errorUtils.create(
				"Test message",
				"TEST_CODE",
			);

			expect(error.message).toBe("Test message");
			expect(error.code).toBe("TEST_CODE");
			expect(error.timestamp).toBeInstanceOf(Date);
		});

		it("should create error without code", () => {
			const error = store._internal.errorUtils.create("Test message");

			expect(error.message).toBe("Test message");
			expect(error.code).toBeUndefined();
			expect(error.timestamp).toBeInstanceOf(Date);
		});

		it("should clear error before new operations", async () => {
			// Set an error
			store._internal.errorUtils.set(
				store._internal.errorUtils.create("Previous error"),
			);
			expect(store.hasError).toBe(true);

			// Perform successful operation
			const mockExecute = mockUseCases.fetchSubscribers
				.execute as MockedFunction<FetchSubscribers["execute"]>;
			mockExecute.mockResolvedValue(mockSubscribers);

			await store.fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Error should be cleared
			expect(store.hasError).toBe(false);
		});
	});
});
