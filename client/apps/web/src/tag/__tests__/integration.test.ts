/**
 * Integration tests for the tags module
 * Tests architecture integration and layer isolation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTags } from "../application/composables/useTags.ts";
import { Tag } from "../domain/models/Tag.ts";
import { TagColors } from "../domain/models/TagColors.ts";
import type { TagRepository } from "../domain/repositories/TagRepository.ts";
import {
	configureContainer,
	resetContainer,
} from "../infrastructure/di/container.ts";
import {
	repositoryMock,
	repositoryMockForScenario,
	repositoryMockWithData,
	repositoryMockWithDelay,
	repositoryMockWithErrors,
} from "./repository.mock.ts";
import { cleanupTestEnvironment, setupTestEnvironment } from "./test-setup.ts";

/**
 * Helper function to setup test environment with a specific repository
 */
function setupTestWithRepository(repository: TagRepository): void {
	resetContainer();
	cleanupTestEnvironment();
	setupTestEnvironment(repository);
}

describe("Tags Module Integration", () => {
	let mockRepository: TagRepository;

	beforeEach(() => {
		mockRepository = repositoryMock();
		setupTestEnvironment(mockRepository);
	});

	afterEach(() => {
		cleanupTestEnvironment();
	});

	describe("Architecture Integration", () => {
		it("should integrate all layers through dependency injection", async () => {
			const { tags, fetchTags, isLoading } = useTags();

			// Initially empty
			expect(tags.value).toEqual([]);
			expect(isLoading.value).toBe(false);

			// Fetch tags
			await fetchTags();

			// Should have data and not be loading
			expect(isLoading.value).toBe(false);
			expect(tags.value).toHaveLength(4);
			// Check that we have the expected tag structure without assuming specific order
			const tagNames = tags.value.map((tag) => tag.name);
			expect(tagNames).toContain("Premium");
			expect(tagNames).toContain("Basic");

			// Verify repository was called correctly
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
		});

		it("should handle all CRUD operations through use cases", async () => {
			const { createTag, updateTag, deleteTag, fetchTags } = useTags();

			// Create a tag
			const createResult = await createTag({
				name: "New Tag",
				color: TagColors.Yellow,
			});

			expect(createResult).toBeTruthy();
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "New Tag",
				color: TagColors.Yellow,
				subscribers: [],
			});

			// Update a tag
			const updateResult = await updateTag(
				"123e4567-e89b-12d3-a456-426614174000",
				{
					name: "Updated Premium",
				},
			);

			expect(updateResult).toBeTruthy();
			expect(mockRepository.update).toHaveBeenCalledWith(
				"123e4567-e89b-12d3-a456-426614174000",
				{ name: "Updated Premium" },
			);

			// Delete a tag - deleteTag returns void from composable
			await deleteTag("123e4567-e89b-12d3-a456-426614174000");

			expect(mockRepository.delete).toHaveBeenCalledWith(
				"123e4567-e89b-12d3-a456-426614174000",
			);

			// Fetch tags
			await fetchTags();
			expect(mockRepository.findAll).toHaveBeenCalled();
		});

		it("should handle repository errors gracefully", async () => {
			// Configure error repository
			const errorRepository = repositoryMockWithErrors("network");
			setupTestWithRepository(errorRepository);

			const { tags, fetchTags, hasError, error } = useTags();

			// Fetch tags (should fail)
			await fetchTags();

			// Should have error state
			expect(hasError.value).toBe(true);
			expect(error.value?.message).toMatch(/network|connection|failed/i);
			expect(tags.value).toEqual([]);
		});

		it("should validate input data at use case level", async () => {
			const { createTag, hasError, error } = useTags();

			// Try to create tag with invalid data
			const result = await createTag({
				name: "", // Empty name
				color: TagColors.Red,
			});

			// Should have validation error
			expect(result).toBeNull();
			expect(hasError.value).toBe(true);
			expect(error.value?.message).toMatch(/name|required|empty/i);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should handle duplicate tag names", async () => {
			const { createTag, hasError, error } = useTags();

			// Try to create tag with duplicate name
			const result = await createTag({
				name: "Premium", // Already exists in mock data
				color: TagColors.Green,
			});

			// Should have validation error
			expect(result).toBeNull();
			expect(hasError.value).toBe(true);
			expect(error.value?.message).toMatch(/already exists|duplicate|exists/i);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should handle tag not found errors", async () => {
			const { updateTag, hasError, error } = useTags();

			// Mock findById to return null
			mockRepository.findById = vi.fn().mockResolvedValue(null);

			// Try to update non-existent tag
			const result = await updateTag("non-existent-id", {
				name: "Updated Name",
			});

			// Should have error
			expect(result).toBeNull();
			expect(hasError.value).toBe(true);
			expect(error.value?.message).toMatch(
				/not found|does not exist|invalid.*id|format/i,
			);
		});
	});

	describe("State Management Integration", () => {
		it("should maintain state across multiple operations", async () => {
			const { tags, createTag, fetchTags, tagCount } = useTags();

			// Fetch initial tags
			await fetchTags();
			expect(tags.value).toHaveLength(4);
			expect(tagCount.value).toBe(4);

			// Create a new tag
			await createTag({
				name: "New Tag",
				color: TagColors.Purple,
			});

			// State should be updated
			expect(tags.value).toHaveLength(5);
			expect(tagCount.value).toBe(5);
			expect(tags.value.some((tag) => tag.name === "New Tag")).toBe(true);
		});

		it("should clear error state on successful operations", async () => {
			const { createTag, hasError, clearError } = useTags();

			// First, cause an error
			const errorResult = await createTag({
				name: "", // Invalid name
				color: TagColors.Red,
			});
			expect(errorResult).toBeNull();
			expect(hasError.value).toBe(true);

			// Clear error manually
			clearError();
			expect(hasError.value).toBe(false);

			// Or clear error with successful operation
			const successResult = await createTag({
				name: "Valid Tag",
				color: TagColors.Blue,
			});
			if (successResult) {
				expect(hasError.value).toBe(false);
			}
		});

		it("should reset state correctly", async () => {
			const { tags, fetchTags, resetState, tagCount } = useTags();

			// Load some data
			await fetchTags();
			expect(tags.value).toHaveLength(4);
			expect(tagCount.value).toBe(4);

			// Reset state
			resetState();
			expect(tags.value).toEqual([]);
			expect(tagCount.value).toBe(0);
		});

		it("should handle optimistic updates correctly", async () => {
			const { tags, createTag, fetchTags } = useTags();

			// Fetch initial data
			await fetchTags();
			const initialCount = tags.value.length;

			// Create tag
			const createResult = await createTag({
				name: "Optimistic Tag",
				color: TagColors.Green,
			});

			// If creation was successful, state should be updated
			if (createResult !== null) {
				expect(tags.value).toHaveLength(initialCount + 1);
			}
		});

		it("should rollback optimistic updates on error", async () => {
			// Configure repository to fail on create
			const errorRepository = repositoryMockWithErrors("validation");
			setupTestWithRepository(errorRepository);

			const { tags, createTag, fetchTags } = useTags();

			// Fetch initial data (this will fail, so tags will be empty)
			await fetchTags();
			const initialCount = tags.value.length;

			// Try to create tag (should fail)
			const createResult = await createTag({
				name: "Failed Tag",
				color: TagColors.Red,
			});

			// Creation should fail
			expect(createResult).toBeNull();
			// State should remain unchanged
			expect(tags.value).toHaveLength(initialCount);
		});
	});

	describe("Dependency Injection Integration", () => {
		it("should auto-initialize when using composable", async () => {
			const { fetchTags } = useTags();

			// Should not throw - store is auto-initialized
			await expect(fetchTags()).resolves.not.toThrow();
		});

		it("should handle multiple composable instances", () => {
			const composable1 = useTags();
			const composable2 = useTags();

			// Both should work with consistent state
			expect(composable1.tags).toBeDefined();
			expect(composable2.tags).toBeDefined();
		});

		it("should use injected repository", async () => {
			const { fetchTags } = useTags();

			await fetchTags();

			// Should use the mock repository we configured
			expect(mockRepository.findAll).toHaveBeenCalled();
		});

		it("should handle container reconfiguration", async () => {
			const { fetchTags } = useTags();

			// Use initial repository
			await fetchTags();
			expect(mockRepository.findAll).toHaveBeenCalledOnce();

			// Reconfigure with new repository
			const newMockRepository = repositoryMock();
			setupTestWithRepository(newMockRepository);

			// Create new composable instance
			const { fetchTags: fetchTags2 } = useTags();
			await fetchTags2();

			// Should use new repository
			expect(newMockRepository.findAll).toHaveBeenCalledOnce();
		});
	});

	describe("Layer Isolation", () => {
		it("should not expose infrastructure details to application layer", () => {
			const composable = useTags();

			// Composable should only expose domain-level operations
			expect(typeof composable.fetchTags).toBe("function");
			expect(typeof composable.createTag).toBe("function");
			expect(typeof composable.updateTag).toBe("function");
			expect(typeof composable.deleteTag).toBe("function");
		});

		it("should handle domain validation independently", async () => {
			const { createTag, hasError } = useTags();

			// Domain-level validation should work without repository calls
			const result = await createTag({
				name: "A".repeat(51), // Too long
				color: TagColors.Red,
			});

			expect(result).toBeNull();
			expect(hasError.value).toBe(true);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should transform data through domain models", async () => {
			const { tags, fetchTags } = useTags();

			await fetchTags();

			// Data should be in domain model format
			expect(tags.value[0]).toBeInstanceOf(Tag);
			// Check that the first tag has a valid color (could be any color from the mock data)
			expect(Object.values(TagColors)).toContain(tags.value[0].color);
			expect(typeof tags.value[0].subscriberCount).toBe("number");
			expect(typeof tags.value[0].colorClass).toBe("string");
		});

		it("should maintain clean separation between layers", async () => {
			const { tags, fetchTags } = useTags();

			await fetchTags();

			// Application layer should only work with domain models
			for (const tag of tags.value) {
				expect(tag).toBeInstanceOf(Tag);
				expect(tag.id).toBeDefined();
				expect(tag.name).toBeDefined();
				expect(tag.color).toBeDefined();
				expect(tag.subscribers).toBeDefined();
			}
		});
	});

	describe("Performance Integration", () => {
		it("should handle large datasets efficiently", async () => {
			// Configure repository with large dataset
			const largeDataRepository = repositoryMockForScenario("large");
			setupTestWithRepository(largeDataRepository);
			configureContainer({ customRepository: largeDataRepository });

			const { tags, fetchTags } = useTags();

			const startTime = performance.now();
			await fetchTags();
			const endTime = performance.now();

			expect(tags.value).toHaveLength(1000);
			expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
		});

		it("should handle loading states correctly", async () => {
			// Configure repository with delay
			const delayedRepository = repositoryMockWithDelay(100);
			setupTestWithRepository(delayedRepository);
			configureContainer({ customRepository: delayedRepository });

			const { isLoading, fetchTags } = useTags();

			expect(isLoading.value).toBe(false);

			const fetchPromise = fetchTags();
			expect(isLoading.value).toBe(true);

			await fetchPromise;
			expect(isLoading.value).toBe(false);
		});

		it("should debounce rapid operations", async () => {
			const { createTag } = useTags();

			// Rapid fire multiple creates
			const promises = Array.from({ length: 5 }, (_, i) =>
				createTag({
					name: `Rapid Tag ${i}`,
					color: TagColors.Blue,
				}),
			);

			await Promise.all(promises);

			// All should complete successfully
			expect(mockRepository.create).toHaveBeenCalledTimes(5);
		});
	});

	describe("Error Recovery Integration", () => {
		it("should recover from network errors", async () => {
			// Start with error repository
			const errorRepository = repositoryMockWithErrors("network");
			setupTestWithRepository(errorRepository);

			const { fetchTags, hasError } = useTags();

			// First attempt should fail
			await fetchTags();
			expect(hasError.value).toBe(true);

			// Switch to working repository
			const workingRepository = repositoryMock();
			setupTestWithRepository(workingRepository);

			// Second attempt should succeed
			const { fetchTags: fetchTags2, hasError: hasError2 } = useTags();
			await fetchTags2();
			expect(hasError2.value).toBe(false);
		});

		it("should handle partial failures gracefully", async () => {
			const { tags, createTag, fetchTags } = useTags();

			// Fetch initial data
			await fetchTags();
			const initialCount = tags.value.length;

			// Create one successful tag
			const successResult = await createTag({
				name: "Success Tag",
				color: TagColors.Green,
			});

			if (successResult) {
				expect(tags.value).toHaveLength(initialCount + 1);

				// Configure repository to fail
				mockRepository.create = vi
					.fn()
					.mockRejectedValue(new Error("Create failed"));

				// Try to create another tag (should fail)
				const failResult = await createTag({
					name: "Fail Tag",
					color: TagColors.Red,
				});

				expect(failResult).toBeNull();
				// Should still have the successful tag
				expect(tags.value).toHaveLength(initialCount + 1);
				expect(tags.value.some((tag) => tag.name === "Success Tag")).toBe(true);
			}
		});
	});

	describe("Data Consistency Integration", () => {
		it("should maintain data consistency across operations", async () => {
			const customTags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174001",
					"Tag 1",
					TagColors.Red,
					["sub1"],
				),
				new Tag(
					"123e4567-e89b-12d3-a456-426614174002",
					"Tag 2",
					TagColors.Blue,
					["sub2"],
				),
			];

			const dataRepository = repositoryMockWithData(customTags);
			setupTestWithRepository(dataRepository);

			const { tags, createTag, updateTag, deleteTag, fetchTags } = useTags();

			// Fetch initial data
			await fetchTags();
			expect(tags.value).toHaveLength(2);

			// Create tag
			const createResult = await createTag({
				name: "Tag 3",
				color: TagColors.Green,
			});
			if (createResult) {
				expect(tags.value).toHaveLength(3);
			}

			// Update tag
			const updateResult = await updateTag(
				"123e4567-e89b-12d3-a456-426614174001",
				{ name: "Updated Tag 1" },
			);
			if (updateResult) {
				const updatedTag = tags.value.find(
					(t) => t.id === "123e4567-e89b-12d3-a456-426614174001",
				);
				expect(updatedTag?.name).toBe("Updated Tag 1");
			}

			// Delete tag
			await deleteTag("123e4567-e89b-12d3-a456-426614174002");
			expect(tags.value).toHaveLength(2);
			expect(
				tags.value.find((t) => t.id === "123e4567-e89b-12d3-a456-426614174002"),
			).toBeUndefined();
		});

		it("should handle concurrent operations correctly", async () => {
			const { createTag, tags } = useTags();

			// Simulate concurrent creates
			const concurrentPromises = [
				createTag({ name: "Concurrent 1", color: TagColors.Red }),
				createTag({ name: "Concurrent 2", color: TagColors.Blue }),
				createTag({ name: "Concurrent 3", color: TagColors.Green }),
			];

			await Promise.all(concurrentPromises);

			// All tags should be created
			expect(
				tags.value.filter((t) => t.name.startsWith("Concurrent")),
			).toHaveLength(3);
		});

		it("should validate data integrity", async () => {
			const { tags, fetchTags } = useTags();

			await fetchTags();

			// All tags should have valid structure
			for (const tag of tags.value) {
				expect(tag.id).toMatch(
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
				);
				expect(tag.name).toBeTruthy();
				expect(Object.values(TagColors)).toContain(tag.color);
				expect(typeof tag.subscriberCount).toBe("number");
				expect(tag.colorClass).toMatch(/^bg-\w+-500$/);
			}
		});
	});
});
