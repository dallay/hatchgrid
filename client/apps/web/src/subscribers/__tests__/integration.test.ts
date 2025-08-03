/**
 * Integration tests for the subscribers module
 * Tests architecture integration and layer isolation
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriberStatus, useSubscribers } from "@/subscribers";
import { repositoryMock } from "@/subscribers/__tests__/repository.mock";
import { resetInitialization } from "@/subscribers/di";
import type { SubscriberRepository } from "@/subscribers/domain";
import { configureContainer, resetContainer } from "../di/container";

describe("Subscribers Module Integration", () => {
	let mockRepository: SubscriberRepository;

	beforeEach(() => {
		setActivePinia(createPinia());
		resetContainer();
		resetInitialization();
		mockRepository = repositoryMock();
		configureContainer({ customRepository: mockRepository });
		vi.clearAllMocks();
	});

	describe("Architecture Integration", () => {
		it("should integrate all layers through dependency injection", async () => {
			const { subscribers, fetchSubscribers, isLoading } = useSubscribers();

			// Initially empty
			expect(subscribers.value).toEqual([]);
			expect(isLoading.value).toBe(false);

			// Fetch subscribers
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Should have data and not be loading
			expect(isLoading.value).toBe(false);
			expect(subscribers.value).toHaveLength(2);
			expect(subscribers.value[0]).toMatchObject({
				id: "1",
				email: "user1@example.com",
				name: "User One",
				status: SubscriberStatus.ENABLED,
			});

			// Verify repository was called correctly
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				undefined,
			);
		});

		it("should handle all data operations through use cases", async () => {
			const { subscribers, statusCounts, tagCounts, fetchAllData, isLoading } =
				useSubscribers();

			// Fetch all data
			await fetchAllData("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// All data should be loaded
			expect(isLoading.value).toBe(false);
			expect(subscribers.value).toHaveLength(2);
			expect(statusCounts.value).toHaveLength(3);
			expect(tagCounts.value).toHaveLength(3);

			// Verify all repository methods were called
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				undefined,
			);
			expect(mockRepository.countByStatus).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
			expect(mockRepository.countByTags).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			);
		});

		it("should handle repository errors gracefully", async () => {
			// Mock repository error
			const repositoryError = new Error("Repository error");
			(
				mockRepository.fetchAll as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(repositoryError);

			const { subscribers, fetchSubscribers, hasError, error } =
				useSubscribers();

			// Fetch subscribers (should fail)
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Should have error state
			expect(hasError.value).toBe(true);
			expect(error.value?.message).toContain("Repository error");
			expect(subscribers.value).toEqual([]);
		});

		it("should validate workspace ID at store level", async () => {
			const { fetchSubscribers, hasError, error } = useSubscribers();

			// Try to fetch with empty workspace ID
			await fetchSubscribers("");

			// Should have validation error
			expect(hasError.value).toBe(true);
			expect(error.value?.code).toBe("INVALID_WORKSPACE_ID");
			expect(mockRepository.fetchAll).not.toHaveBeenCalled();
		});

		it("should pass filters through to repository", async () => {
			const { fetchSubscribers } = useSubscribers();

			const filters = {
				status: SubscriberStatus.ENABLED,
				search: "user1",
			};

			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead", filters);

			// Verify repository was called with filters
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				"d2054881-b8c1-4bfa-93ce-a0e94d003ead",
				filters,
			);
		});
	});

	describe("State Management Integration", () => {
		it("should maintain state across multiple operations", async () => {
			const { subscribers, statusCounts, fetchSubscribers, store } =
				useSubscribers();

			// Fetch subscribers first
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(subscribers.value).toHaveLength(2);

			// Fetch status counts
			await store.countByStatus("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(statusCounts.value).toHaveLength(3);

			// Both should still be available
			expect(subscribers.value).toHaveLength(2);
			expect(statusCounts.value).toHaveLength(3);
		});

		it("should clear error state on successful operations", async () => {
			const { fetchSubscribers, hasError, clearError } = useSubscribers();

			// First, cause an error
			(
				mockRepository.fetchAll as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error("Network error"));
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(hasError.value).toBe(true);

			// Clear error manually
			clearError();
			expect(hasError.value).toBe(false);

			// Or clear error with successful operation
			(
				mockRepository.fetchAll as ReturnType<typeof vi.fn>
			).mockResolvedValueOnce([]);
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(hasError.value).toBe(false);
		});

		it("should reset state correctly", async () => {
			const { subscribers, fetchSubscribers, resetState, subscriberCount } =
				useSubscribers();

			// Load some data
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			expect(subscribers.value).toHaveLength(2);
			expect(subscriberCount.value).toBe(2);

			// Reset state
			resetState();
			expect(subscribers.value).toEqual([]);
			expect(subscriberCount.value).toBe(0);
		});
	});

	describe("Dependency Injection Integration", () => {
		it("should auto-initialize when using composable", async () => {
			const { fetchSubscribers } = useSubscribers();
			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");
			// If fetchSubscribers does not throw, store is initialized and functional
		});

		it("should handle multiple composable instances", () => {
			const composable1 = useSubscribers();
			const composable2 = useSubscribers();

			// Both should work and share the same store
			expect(composable1.store).toBe(composable2.store);
		});

		it("should use injected repository", async () => {
			const { fetchSubscribers } = useSubscribers();

			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Should use the mock repository we configured
			expect(mockRepository.fetchAll).toHaveBeenCalled();
		});
	});

	describe("Layer Isolation", () => {
		it("should not expose infrastructure details to presentation layer", () => {
			const { store } = useSubscribers();

			// Store should not expose repository directly
			expect("repository" in store).toBe(false);

			// Store should only expose domain-level operations
			expect(typeof store.fetchSubscribers).toBe("function");
			expect(typeof store.countByStatus).toBe("function");
			expect(typeof store.countByTags).toBe("function");
		});

		it("should handle domain validation independently", async () => {
			const { fetchSubscribers, hasError } = useSubscribers();

			// Domain-level validation should work without repository calls
			await fetchSubscribers("   "); // whitespace-only workspace ID

			expect(hasError.value).toBe(true);
			expect(mockRepository.fetchAll).not.toHaveBeenCalled();
		});

		it("should transform data through domain models", async () => {
			const { subscribers, fetchSubscribers } = useSubscribers();

			await fetchSubscribers("d2054881-b8c1-4bfa-93ce-a0e94d003ead");

			// Data should be in domain model format
			expect(subscribers.value[0].status).toBe(SubscriberStatus.ENABLED);
			expect(typeof subscribers.value[0].id).toBe("string");
			expect(typeof subscribers.value[0].email).toBe("string");
		});
	});
});
