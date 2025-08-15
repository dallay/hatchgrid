/**
 * Unit tests for CreateTag use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tag } from "../models/Tag.ts";
import { TagColors } from "../models/TagColors.ts";
import type { TagRepository } from "../repositories";
import { CreateTag, type CreateTagData } from "./CreateTag.ts";

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
const validCreateData: CreateTagData = {
	name: "Newsletter",
	color: TagColors.Green,
};

const createdTag = new Tag(
	"123e4567-e89b-12d3-a456-426614174002",
	"Newsletter",
	TagColors.Green,
	[],
	"2024-01-01T00:00:00Z",
	"2024-01-01T00:00:00Z",
);

describe("CreateTag", () => {
	let useCase: CreateTag;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new CreateTag(mockRepository);
	});

	describe("execute", () => {
		it("should create tag successfully with valid data", async () => {
			// Arrange
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act
			const result = await useCase.execute(validCreateData);

			// Assert
			expect(mockRepository.existsByName).toHaveBeenCalledWith(
				"Newsletter",
				undefined,
			);
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "Newsletter",
				color: TagColors.Green,
				subscribers: [],
			});
			expect(result).toEqual(createdTag);
		});

		it("should trim whitespace from tag name", async () => {
			// Arrange
			const dataWithWhitespace: CreateTagData = {
				name: "  Spaced Tag  ",
				color: TagColors.Yellow,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act
			await useCase.execute(dataWithWhitespace);

			// Assert
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "Spaced Tag",
				color: TagColors.Yellow,
				subscribers: [],
			});
		});

		it("should throw error for empty tag name", async () => {
			// Arrange
			const invalidData: CreateTagData = {
				name: "",
				color: TagColors.Red,
			};

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				"tag.validation.name.empty",
			);
			expect(mockRepository.findAll).not.toHaveBeenCalled();
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only tag name", async () => {
			// Arrange
			const invalidData: CreateTagData = {
				name: "   ",
				color: TagColors.Red,
			};

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				"Tag name cannot be empty",
			);
			expect(mockRepository.findAll).not.toHaveBeenCalled();
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for tag name exceeding 50 characters", async () => {
			// Arrange
			const invalidData: CreateTagData = {
				name: "A".repeat(51),
				color: TagColors.Red,
			};

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				"tag.validation.name.tooLong",
			);
			expect(mockRepository.findAll).not.toHaveBeenCalled();
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should accept tag name at maximum length (50 characters)", async () => {
			// Arrange
			const validData: CreateTagData = {
				name: "A".repeat(50),
				color: TagColors.Red,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act
			await useCase.execute(validData);

			// Assert
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "A".repeat(50),
				color: TagColors.Red,
				subscribers: [],
			});
		});

		it("should throw error for missing color", async () => {
			// Arrange
			const invalidData = {
				name: "Valid Name",
				color: undefined,
			} as unknown as CreateTagData;

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				'Invalid option: expected one of "red"|"green"|"blue"|"yellow"|"purple"|"gray"',
			);
			expect(mockRepository.findAll).not.toHaveBeenCalled();
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for invalid color", async () => {
			// Arrange
			const invalidData = {
				name: "Valid Name",
				color: "invalid-color",
			} as unknown as CreateTagData;

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				'Invalid option: expected one of "red"|"green"|"blue"|"yellow"|"purple"|"gray"',
			);
			expect(mockRepository.findAll).not.toHaveBeenCalled();
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for duplicate tag name (case insensitive)", async () => {
			// Arrange
			const duplicateData: CreateTagData = {
				name: "PREMIUM", // Exists as "Premium"
				color: TagColors.Green,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(true);

			// Act & Assert
			await expect(useCase.execute(duplicateData)).rejects.toThrow(
				'Tag with name "PREMIUM" already exists',
			);
			expect(mockRepository.existsByName).toHaveBeenCalledWith(
				"PREMIUM",
				undefined,
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for duplicate tag name with whitespace", async () => {
			// Arrange
			const duplicateData: CreateTagData = {
				name: "  Premium  ", // Exists as "Premium"
				color: TagColors.Green,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(true);

			// Act & Assert
			await expect(useCase.execute(duplicateData)).rejects.toThrow(
				'Tag with name "Premium" already exists',
			);
			expect(mockRepository.existsByName).toHaveBeenCalledWith(
				"Premium",
				undefined,
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should handle repository error during uniqueness check", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			vi.mocked(mockRepository.existsByName).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(validCreateData)).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should handle repository error during creation", async () => {
			// Arrange
			const repositoryError = new Error("Creation failed");
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(validCreateData)).rejects.toThrow(
				"Creation failed",
			);
			expect(mockRepository.existsByName).toHaveBeenCalledOnce();
			expect(mockRepository.create).toHaveBeenCalledOnce();
		});

		it("should validate all tag colors are accepted", async () => {
			// Arrange
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			const colors = Object.values(TagColors);

			// Act & Assert
			for (const color of colors) {
				const data: CreateTagData = {
					name: `Tag ${color}`,
					color,
				};

				await expect(useCase.execute(data)).resolves.not.toThrow();
			}

			expect(mockRepository.create).toHaveBeenCalledTimes(colors.length);
		});

		it("should handle special characters in tag name", async () => {
			// Arrange
			const specialData: CreateTagData = {
				name: "Tag with émojis 🏷️ & symbols!",
				color: TagColors.Purple,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act
			await useCase.execute(specialData);

			// Assert
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "Tag with émojis 🏷️ & symbols!",
				color: TagColors.Purple,
				subscribers: [],
			});
		});

		it("should initialize new tags with empty subscribers array", async () => {
			// Arrange
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act
			await useCase.execute(validCreateData);

			// Assert
			expect(mockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					subscribers: [],
				}),
			);
		});
	});

	describe("validateTagData", () => {
		it("should validate all required fields are present", async () => {
			// Arrange
			const validData: CreateTagData = {
				name: "Valid Tag",
				color: TagColors.Blue,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act & Assert
			await expect(useCase.execute(validData)).resolves.not.toThrow();
		});

		it("should reject null or undefined name", async () => {
			// Arrange
			const invalidData = {
				name: null,
				color: TagColors.Red,
			} as unknown as CreateTagData;

			// Act & Assert
			await expect(useCase.execute(invalidData)).rejects.toThrow(
				"Invalid input: expected string, received null",
			);
		});
	});

	describe("validateUniqueTagName", () => {
		it("should pass validation when name is unique", async () => {
			// Arrange
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act & Assert
			await expect(useCase.execute(validCreateData)).resolves.not.toThrow();
		});

		it("should handle empty existing tags list", async () => {
			// Arrange
			vi.mocked(mockRepository.existsByName).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(createdTag);

			// Act & Assert
			await expect(useCase.execute(validCreateData)).resolves.not.toThrow();
		});

		it("should perform case-insensitive comparison", async () => {
			// Arrange
			const duplicateData: CreateTagData = {
				name: "mixed case",
				color: TagColors.Blue,
			};
			vi.mocked(mockRepository.existsByName).mockResolvedValue(true);

			// Act & Assert
			await expect(useCase.execute(duplicateData)).rejects.toThrow(
				'Tag with name "mixed case" already exists',
			);
		});
	});
});
