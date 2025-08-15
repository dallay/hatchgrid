/**
 * Unit tests for UpdateTag use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tag } from "../models/Tag.ts";
import { TagColors } from "../models/TagColors.ts";
import type { TagRepository } from "../repositories";
import { UpdateTag, type UpdateTagData } from "./UpdateTag.ts";

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
const existingTag = new Tag(
	"123e4567-e89b-12d3-a456-426614174000",
	"Premium",
	TagColors.Red,
	["sub1", "sub2"],
	"2024-01-01T00:00:00Z",
	"2024-01-01T00:00:00Z",
);

const otherExistingTags: Tag[] = [
	new Tag("123e4567-e89b-12d3-a456-426614174001", "Basic", TagColors.Blue, []),
	new Tag(
		"123e4567-e89b-12d3-a456-426614174002",
		"Newsletter",
		TagColors.Green,
		["sub3"],
	),
];

const allExistingTags = [existingTag, ...otherExistingTags];

const updatedTag = new Tag(
	"123e4567-e89b-12d3-a456-426614174000",
	"Premium Plus",
	TagColors.Purple,
	["sub1", "sub2"],
	"2024-01-01T00:00:00Z",
	"2024-01-01T12:00:00Z",
);

describe("UpdateTag", () => {
	let useCase: UpdateTag;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new UpdateTag(mockRepository);
	});

	describe("execute", () => {
		it("should update tag name successfully", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "Premium Plus",
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			const result = await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(existingTag.id);
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Premium Plus",
			});
			expect(result).toEqual(updatedTag);
		});

		it("should update tag color successfully", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				color: TagColors.Purple,
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			const result = await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.findById).toHaveBeenCalledWith(existingTag.id);
			expect(mockRepository.findAll).not.toHaveBeenCalled(); // No name change, no uniqueness check
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				color: TagColors.Purple,
			});
			expect(result).toEqual(updatedTag);
		});

		it("should update both name and color successfully", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "Premium Plus",
				color: TagColors.Purple,
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			const result = await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Premium Plus",
				color: TagColors.Purple,
			});
			expect(result).toEqual(updatedTag);
		});

		it("should trim whitespace from updated name", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "  Premium Plus  ",
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Premium Plus",
			});
		});

		it("should throw error for invalid tag ID format", async () => {
			// Arrange
			const invalidId = "invalid-uuid";
			const updateData: UpdateTagData = {
				name: "New Name",
			};

			// Act & Assert
			await expect(useCase.execute(invalidId, updateData)).rejects.toThrow(
				"Invalid Tag ID format",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for empty tag ID", async () => {
			// Arrange
			const emptyId = "";
			const updateData: UpdateTagData = {
				name: "New Name",
			};

			// Act & Assert
			await expect(useCase.execute(emptyId, updateData)).rejects.toThrow(
				"Tag ID is required",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only tag ID", async () => {
			// Arrange
			const whitespaceId = "   ";
			const updateData: UpdateTagData = {
				name: "New Name",
			};

			// Act & Assert
			await expect(useCase.execute(whitespaceId, updateData)).rejects.toThrow(
				"Tag ID is required",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error when tag not found", async () => {
			// Arrange
			const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
			const updateData: UpdateTagData = {
				name: "New Name",
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			// Act & Assert
			await expect(useCase.execute(nonExistentId, updateData)).rejects.toThrow(
				`Tag with ID ${nonExistentId} not found`,
			);
			expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it("should throw error when no update data provided", async () => {
			// Arrange
			const updateData: UpdateTagData = {};

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"At least one field must be provided for update",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for empty name update", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "",
			};

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Tag name cannot be empty",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only name update", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "   ",
			};

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Tag name cannot be empty",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for name exceeding 50 characters", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "A".repeat(51),
			};

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Tag name cannot exceed 50 characters",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should accept name at maximum length (50 characters)", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "A".repeat(50),
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "A".repeat(50),
			});
		});

		it("should throw error for invalid color", async () => {
			// Arrange
			const updateData = {
				color: "invalid-color",
			} as unknown as UpdateTagData;

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Invalid tag color: invalid-color",
			);
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it("should throw error for duplicate name (case insensitive)", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "BASIC", // Exists as "Basic"
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				'Tag with name "BASIC" already exists',
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it("should allow updating to same name (no change)", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "Premium", // Same as current name
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.update).mockResolvedValue(existingTag);

			// Act
			const result = await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.findAll).not.toHaveBeenCalled(); // No uniqueness check needed
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Premium",
			});
			expect(result).toEqual(existingTag);
		});

		it("should handle repository error during tag lookup", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "New Name",
			};
			const repositoryError = new Error("Database connection failed");
			vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it("should handle repository error during uniqueness check", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "New Name",
			};
			const repositoryError = new Error("Database connection failed");
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it("should handle repository error during update", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "New Name",
			};
			const repositoryError = new Error("Update failed");
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(existingTag.id, updateData)).rejects.toThrow(
				"Update failed",
			);
		});

		it("should validate all tag colors are accepted", async () => {
			// Arrange
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			const colors = Object.values(TagColors);

			// Act & Assert
			for (const color of colors) {
				const updateData: UpdateTagData = { color };
				await expect(
					useCase.execute(existingTag.id, updateData),
				).resolves.not.toThrow();
			}

			expect(mockRepository.update).toHaveBeenCalledTimes(colors.length);
		});

		it("should handle special characters in updated name", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "Tag with émojis 🏷️ & symbols!",
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Tag with émojis 🏷️ & symbols!",
			});
		});

		it("should exclude current tag from uniqueness check", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "Basic", // Same name as current tag - should be allowed
			};
			const currentTag = allExistingTags[1]; // "Basic" tag
			const updatedBasicTag = new Tag(
				currentTag.id,
				"Basic",
				currentTag.color,
				currentTag.subscribers,
				currentTag.createdAt,
				new Date().toISOString(),
			);
			vi.mocked(mockRepository.findById).mockResolvedValue(currentTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedBasicTag);

			// Act
			const result = await useCase.execute(currentTag.id, updateData);

			// Assert
			expect(result).toEqual(updatedBasicTag);
			expect(mockRepository.update).toHaveBeenCalledWith(currentTag.id, {
				name: "Basic",
			});
		});
	});

	describe("validateTagId", () => {
		it("should accept valid UUID v4", async () => {
			// Arrange
			const validId = "123e4567-e89b-12d3-a456-426614174000";
			const updateData: UpdateTagData = { color: TagColors.Red };
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act & Assert
			await expect(useCase.execute(validId, updateData)).resolves.not.toThrow();
		});

		it("should reject invalid UUID formats", async () => {
			// Arrange
			const invalidIds = [
				"123",
				"not-a-uuid",
				"123e4567-e89b-12d3-a456-42661417400", // Too short
				"123e4567-e89b-12d3-a456-426614174000-extra", // Too long
				"123e4567-e89b-12d3-a456-426614174000x", // Invalid character
			];
			const updateData: UpdateTagData = { color: TagColors.Red };

			// Act & Assert
			for (const invalidId of invalidIds) {
				await expect(useCase.execute(invalidId, updateData)).rejects.toThrow(
					"Invalid Tag ID format",
				);
			}
		});
	});

	describe("sanitizeUpdateData", () => {
		it("should only include provided fields in sanitized data", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "New Name",
				// color is undefined
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "New Name",
				// color should not be included
			});
		});

		it("should trim whitespace from name in sanitized data", async () => {
			// Arrange
			const updateData: UpdateTagData = {
				name: "  Trimmed Name  ",
			};
			vi.mocked(mockRepository.findById).mockResolvedValue(existingTag);
			vi.mocked(mockRepository.findAll).mockResolvedValue(allExistingTags);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedTag);

			// Act
			await useCase.execute(existingTag.id, updateData);

			// Assert
			expect(mockRepository.update).toHaveBeenCalledWith(existingTag.id, {
				name: "Trimmed Name",
			});
		});
	});
});
