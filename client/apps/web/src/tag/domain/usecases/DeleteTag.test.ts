/**
 * Unit tests for DeleteTag use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tag } from "../models/Tag.ts";
import { TagColors } from "../models/TagColors.ts";
import type { TagRepository } from "../repositories";
import { DeleteTag } from "./DeleteTag.ts";
import { TagNotFoundError, TagValidationError } from "./shared/TagErrors";

// Mock repository
const mockRepository: TagRepository = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	existsByName: vi.fn(),
};

// Test data
const existingTagWithSubscribers = new Tag(
	"123e4567-e89b-12d3-a456-426614174000",
	"Premium",
	TagColors.Red,
	[
		"123e4567-e89b-12d3-a456-426614174003",
		"123e4567-e89b-12d3-a456-426614174004",
		"123e4567-e89b-12d3-a456-426614174005",
	],
	"2024-01-01T00:00:00Z",
	"2024-01-01T00:00:00Z",
);

const existingTagWithoutSubscribers = new Tag(
	"123e4567-e89b-12d3-a456-426614174001",
	"Empty",
	TagColors.Blue,
	[],
	"2024-01-01T00:00:00Z",
	"2024-01-01T00:00:00Z",
);

const existingTagWithStringCount = new Tag(
	"123e4567-e89b-12d3-a456-426614174002",
	"Newsletter",
	TagColors.Green,
	"5",
	"2024-01-01T00:00:00Z",
	"2024-01-01T00:00:00Z",
);

describe("DeleteTag", () => {
	let useCase: DeleteTag;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new DeleteTag(mockRepository);
	});

	describe("execute", () => {
		it("should delete tag successfully when tag exists", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Act
			await useCase.execute(existingTagWithoutSubscribers.id);

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithoutSubscribers.id,
			);
			expect(mockRepository.delete).toHaveBeenCalledWith(
				existingTagWithoutSubscribers.id,
			);
		});

		it("should delete tag with subscribers and log warning", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Mock console.warn to verify it's called
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act
			await useCase.execute(existingTagWithSubscribers.id);

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithSubscribers.id,
			);
			expect(mockRepository.delete).toHaveBeenCalledWith(
				existingTagWithSubscribers.id,
			);
			expect(consoleSpy).toHaveBeenCalledWith("Tag deletion with subscribers", {
				tagId: "123e4567-e89b-12d3-a456-426614174000",
				tagName: "Premium",
				subscriberCount: 3,
				action: "delete_tag_with_subscribers",
			});

			consoleSpy.mockRestore();
		});

		it("should delete tag with string subscriber count and log warning", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithStringCount,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Mock console.warn to verify it's called
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act
			await useCase.execute(existingTagWithStringCount.id);

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithStringCount.id,
			);
			expect(mockRepository.delete).toHaveBeenCalledWith(
				existingTagWithStringCount.id,
			);
			expect(consoleSpy).toHaveBeenCalledWith("Tag deletion with subscribers", {
				tagId: "123e4567-e89b-12d3-a456-426614174002",
				tagName: "Newsletter",
				subscriberCount: 5,
				action: "delete_tag_with_subscribers",
			});

			consoleSpy.mockRestore();
		});

		it("should throw TagValidationError for invalid tag ID format", async () => {
			// Arrange
			const invalidId = "invalid-uuid";

			// Act & Assert
			await expect(useCase.execute(invalidId)).rejects.toThrow(
				TagValidationError,
			);
			await expect(useCase.execute(invalidId)).rejects.toThrow(
				"Invalid Tag ID format",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});

		it("should throw error for empty tag ID", async () => {
			// Arrange
			const emptyId = "";

			// Act & Assert
			await expect(useCase.execute(emptyId)).rejects.toThrow(
				"Tag ID is required",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only tag ID", async () => {
			// Arrange
			const whitespaceId = "   ";

			// Act & Assert
			await expect(useCase.execute(whitespaceId)).rejects.toThrow(
				"Tag ID is required",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});

		it("should throw TagNotFoundError when tag not found", async () => {
			// Arrange
			const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			// Act & Assert
			await expect(useCase.execute(nonExistentId)).rejects.toThrow(
				TagNotFoundError,
			);
			await expect(useCase.execute(nonExistentId)).rejects.toThrow(
				`Tag with ID ${nonExistentId} not found`,
			);
			expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});

		it("should handle repository error during tag lookup", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				useCase.execute(existingTagWithoutSubscribers.id),
			).rejects.toThrow("Database connection failed");
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});

		it("should handle repository error during deletion", async () => {
			// Arrange
			const repositoryError = new Error("Deletion failed");
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);
			vi.mocked(mockRepository.delete).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				useCase.execute(existingTagWithoutSubscribers.id),
			).rejects.toThrow("Deletion failed");
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithoutSubscribers.id,
			);
		});

		it("should handle tag with zero subscribers without warning", async () => {
			// Arrange
			const tagWithZeroCount = new Tag(
				"123e4567-e89b-12d3-a456-426614174003",
				"Zero Count",
				TagColors.Yellow,
				"0",
			);
			vi.mocked(mockRepository.findById).mockResolvedValue(tagWithZeroCount);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Mock console.warn to verify it's not called
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act
			await useCase.execute(tagWithZeroCount.id);

			// Assert
			expect(mockRepository.delete).toHaveBeenCalledWith(tagWithZeroCount.id);
			expect(consoleSpy).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("canDelete", () => {
		it("should return true for existing tag without subscribers", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);

			// Act
			const result = await useCase.canDelete(existingTagWithoutSubscribers.id);

			// Assert
			expect(result).toBe(true);
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithoutSubscribers.id,
			);
		});

		it("should return true for existing tag with subscribers (current business rule)", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithSubscribers,
			);

			// Act
			const result = await useCase.canDelete(existingTagWithSubscribers.id);

			// Assert
			expect(result).toBe(true);
			expect(mockRepository.findById).toHaveBeenCalledWith(
				existingTagWithSubscribers.id,
			);
		});

		it("should return false for non-existent tag", async () => {
			// Arrange
			const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			// Act
			const result = await useCase.canDelete(nonExistentId);

			// Assert
			expect(result).toBe(false);
			expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
		});

		it("should return false for invalid tag ID", async () => {
			// Arrange
			const invalidId = "invalid-uuid";

			// Act
			const result = await useCase.canDelete(invalidId);

			// Assert
			expect(result).toBe(false);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should return false for empty tag ID", async () => {
			// Arrange
			const emptyId = "";

			// Act
			const result = await useCase.canDelete(emptyId);

			// Assert
			expect(result).toBe(false);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should return false when repository throws error", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

			// Act
			const result = await useCase.canDelete(existingTagWithoutSubscribers.id);

			// Assert
			expect(result).toBe(false);
		});

		it("should handle tag with string subscriber count", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithStringCount,
			);

			// Act
			const result = await useCase.canDelete(existingTagWithStringCount.id);

			// Assert
			expect(result).toBe(true);
		});
	});

	describe("validateTagId", () => {
		it("should accept valid UUID v4", async () => {
			// Arrange
			const validId = "123e4567-e89b-12d3-a456-426614174000";
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Act & Assert
			await expect(useCase.execute(validId)).resolves.not.toThrow();
		});

		it("should reject invalid UUID formats", async () => {
			// Arrange
			const invalidIds = [
				"123",
				"not-a-uuid",
				"123e4567-e89b-12d3-a456-42661417400", // Too short
				"123e4567-e89b-12d3-a456-426614174000-extra", // Too long
				"123e4567-e89b-12d3-a456-426614174000x", // Invalid character
				"123e4567-e89b-12d3-g456-426614174000", // Invalid hex character
			];

			// Act & Assert
			for (const invalidId of invalidIds) {
				await expect(useCase.execute(invalidId)).rejects.toThrow(
					"Invalid Tag ID format",
				);
			}
		});

		it("should accept UUID with different versions", async () => {
			// Arrange
			const validIds = [
				"123e4567-e89b-12d3-a456-426614174000", // v4 (variant bits: a)
				"123e4567-e89b-1234-8456-426614174000", // v1 (variant bits: 8)
				"123e4567-e89b-2234-9456-426614174000", // v2 (variant bits: 9)
				"123e4567-e89b-3234-a456-426614174000", // v3 (variant bits: a)
				"123e4567-e89b-5234-b456-426614174000", // v5 (variant bits: b)
				"123E4567-E89B-12D3-A456-426614174000", // Uppercase should be valid
			];
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Act & Assert
			for (const validId of validIds) {
				await expect(useCase.execute(validId)).resolves.not.toThrow();
			}
		});
	});

	describe("validateDeletionRules", () => {
		it("should not throw error for tag without subscribers", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithoutSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Act & Assert
			await expect(
				useCase.execute(existingTagWithoutSubscribers.id),
			).resolves.not.toThrow();
		});

		it("should log warning but not throw error for tag with subscribers", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(
				existingTagWithSubscribers,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Mock console.warn
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act & Assert
			await expect(
				useCase.execute(existingTagWithSubscribers.id),
			).resolves.not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith("Tag deletion with subscribers", {
				tagId: "123e4567-e89b-12d3-a456-426614174000",
				tagName: "Premium",
				subscriberCount: 3,
				action: "delete_tag_with_subscribers",
			});

			consoleSpy.mockRestore();
		});

		it("should handle tag with undefined subscriberCount", async () => {
			// Arrange
			const tagWithUndefinedCount = new Tag(
				"123e4567-e89b-12d3-a456-426614174004",
				"Undefined Count",
				TagColors.Gray,
				[], // Empty array results in subscriberCount of 0
			);
			vi.mocked(mockRepository.findById).mockResolvedValue(
				tagWithUndefinedCount,
			);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Act & Assert
			await expect(
				useCase.execute(tagWithUndefinedCount.id),
			).resolves.not.toThrow();
		});

		it("should handle tag with invalid string subscriberCount", async () => {
			// Arrange
			const tagWithInvalidCount = new Tag(
				"123e4567-e89b-12d3-a456-426614174005",
				"Invalid Count",
				TagColors.Gray,
				"invalid-number", // This will result in NaN from parseInt, but should be handled as 0
			);
			vi.mocked(mockRepository.findById).mockResolvedValue(tagWithInvalidCount);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			// Mock console.warn to verify it's not called (since subscriberCount should be 0)
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act
			await useCase.execute(tagWithInvalidCount.id);

			// Assert
			expect(mockRepository.delete).toHaveBeenCalledWith(
				tagWithInvalidCount.id,
			);
			expect(consoleSpy).not.toHaveBeenCalled(); // No warning for 0 subscribers

			consoleSpy.mockRestore();
		});
	});
});
