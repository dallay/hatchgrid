/**
 * Unit tests for CountByTags use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CountByTagsResponse } from "../models";
import type { SubscriberRepository } from "../repositories";
import { CountByTags } from "./CountByTags";

// Mock repository
const mockRepository: SubscriberRepository = {
	fetchAll: vi.fn(),
	countByStatus: vi.fn(),
	countByTags: vi.fn(),
};

// Test data
const mockCountByTagsResponse: CountByTagsResponse[] = [
	{ count: 15, tag: "newsletter" },
	{ count: 8, tag: "premium" },
	{ count: 12, tag: "beta-tester" },
	{ count: 3, tag: "vip" },
	{ count: 8, tag: "early-adopter" },
];

describe("CountByTags", () => {
	let useCase: CountByTags;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new CountByTags(mockRepository);
	});

	describe("execute", () => {
		it("should count subscribers by tags successfully", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(mockRepository.countByTags).toHaveBeenCalledWith(workspaceId);
			expect(result).toHaveLength(5);
			// Should be sorted by count descending, then by tag name ascending
			expect(result[0]).toEqual({ count: 15, tag: "newsletter" });
			expect(result[1]).toEqual({ count: 12, tag: "beta-tester" });
			// For equal counts (8), should be sorted by tag name
			expect(result[2]).toEqual({ count: 8, tag: "early-adopter" });
			expect(result[3]).toEqual({ count: 8, tag: "premium" });
			expect(result[4]).toEqual({ count: 3, tag: "vip" });
		});

		it("should handle empty response from repository", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue([]);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toEqual([]);
		});

		it("should filter out empty tags", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const responseWithEmptyTags: CountByTagsResponse[] = [
				{ count: 10, tag: "valid-tag" },
				{ count: 5, tag: "" },
				{ count: 3, tag: "   " },
				{ count: 7, tag: "another-valid-tag" },
			];
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				responseWithEmptyTags,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toHaveLength(2);
			expect(result).toEqual([
				{ count: 10, tag: "valid-tag" },
				{ count: 7, tag: "another-valid-tag" },
			]);
		});

		it("should throw error for empty workspace ID", async () => {
			// Arrange
			const workspaceId = "";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.countByTags).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only workspace ID", async () => {
			// Arrange
			const workspaceId = "   ";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.countByTags).not.toHaveBeenCalled();
		});

		it("should throw error for negative count values", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const invalidResponse: CountByTagsResponse[] = [
				{ count: -1, tag: "invalid-count" },
			];
			vi.mocked(mockRepository.countByTags).mockResolvedValue(invalidResponse);

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Invalid count value: -1 for tag: invalid-count",
			);
		});

		it("should propagate repository errors", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const repositoryError = new Error("Repository connection failed");
			vi.mocked(mockRepository.countByTags).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Repository connection failed",
			);
		});

		it("should sort tags with same count alphabetically", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const sameCountResponse: CountByTagsResponse[] = [
				{ count: 5, tag: "zebra" },
				{ count: 5, tag: "alpha" },
				{ count: 5, tag: "beta" },
			];
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				sameCountResponse,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toEqual([
				{ count: 5, tag: "alpha" },
				{ count: 5, tag: "beta" },
				{ count: 5, tag: "zebra" },
			]);
		});
	});

	describe("getTotalCount", () => {
		it("should return total count across all tags", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getTotalCount(workspaceId);

			// Assert
			expect(result).toBe(46); // 15 + 8 + 12 + 3 + 8
		});

		it("should return zero for empty counts", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue([]);

			// Act
			const result = await useCase.getTotalCount(workspaceId);

			// Assert
			expect(result).toBe(0);
		});
	});

	describe("getCountForTag", () => {
		it("should return count for specific tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getCountForTag(workspaceId, "newsletter");

			// Assert
			expect(result).toBe(15);
		});

		it("should return zero for non-existent tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getCountForTag(workspaceId, "non-existent");

			// Assert
			expect(result).toBe(0);
		});

		it("should return zero for empty tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";

			// Act
			const result = await useCase.getCountForTag(workspaceId, "");

			// Assert
			expect(result).toBe(0);
			expect(mockRepository.countByTags).not.toHaveBeenCalled();
		});

		it("should trim whitespace from tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getCountForTag(
				workspaceId,
				"  newsletter  ",
			);

			// Assert
			expect(result).toBe(15);
		});
	});

	describe("getTopTags", () => {
		it("should return top N tags by count", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getTopTags(workspaceId, 3);

			// Assert
			expect(result).toHaveLength(3);
			expect(result[0]).toEqual({ count: 15, tag: "newsletter" });
			expect(result[1]).toEqual({ count: 12, tag: "beta-tester" });
			expect(result[2]).toEqual({ count: 8, tag: "early-adopter" });
		});

		it("should return all tags if limit exceeds available tags", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getTopTags(workspaceId, 100);

			// Assert
			expect(result).toHaveLength(5);
		});

		it("should use default limit of 10", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.getTopTags(workspaceId);

			// Assert
			expect(result).toHaveLength(5); // All available tags since less than 10
		});

		it("should throw error for invalid limit", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";

			// Act & Assert
			await expect(useCase.getTopTags(workspaceId, 0)).rejects.toThrow(
				"Limit must be greater than 0",
			);
			await expect(useCase.getTopTags(workspaceId, -1)).rejects.toThrow(
				"Limit must be greater than 0",
			);
		});
	});

	describe("hasTag", () => {
		it("should return true for existing tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.hasTag(workspaceId, "newsletter");

			// Assert
			expect(result).toBe(true);
		});

		it("should return false for non-existent tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByTags).mockResolvedValue(
				mockCountByTagsResponse,
			);

			// Act
			const result = await useCase.hasTag(workspaceId, "non-existent");

			// Assert
			expect(result).toBe(false);
		});

		it("should return false for empty tag", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";

			// Act
			const result = await useCase.hasTag(workspaceId, "");

			// Assert
			expect(result).toBe(false);
		});
	});
});
