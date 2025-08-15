/**
 * Unit tests for FetchTags use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tag } from "../models/Tag.ts";
import { TagColors } from "../models/TagColors.ts";
import type { TagRepository } from "../repositories";
import { FetchTags } from "./FetchTags.ts";

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
const mockTags: Tag[] = [
	new Tag(
		"123e4567-e89b-12d3-a456-426614174000",
		"Premium",
		TagColors.Red,
		["sub1", "sub2"],
		"2024-01-01T00:00:00Z",
		"2024-01-01T00:00:00Z",
	),
	new Tag(
		"123e4567-e89b-12d3-a456-426614174001",
		"Basic",
		TagColors.Blue,
		["sub3"],
		"2024-01-01T00:00:00Z",
		"2024-01-01T00:00:00Z",
	),
	new Tag(
		"123e4567-e89b-12d3-a456-426614174002",
		"Newsletter",
		TagColors.Green,
		[],
		"2024-01-01T00:00:00Z",
		"2024-01-01T00:00:00Z",
	),
];

describe("FetchTags", () => {
	let useCase: FetchTags;

	beforeEach(() => {
		useCase = new FetchTags(mockRepository);
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should return tags sorted alphabetically by name", async () => {
			// Arrange - Use unsorted mock data
			const unsortedTags = [mockTags[1], mockTags[2], mockTags[0]]; // Basic, Newsletter, Premium
			vi.mocked(mockRepository.findAll).mockResolvedValue(unsortedTags);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
			expect(result).toHaveLength(3);
			expect(result[0].name).toBe("Basic"); // Sorted alphabetically
			expect(result[1].name).toBe("Newsletter");
			expect(result[2].name).toBe("Premium");
		});

		it("should handle empty result from repository", async () => {
			// Arrange
			vi.mocked(mockRepository.findAll).mockResolvedValue([]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
			expect(result).toHaveLength(0);
		});

		it("should filter out invalid tags and return only valid ones", async () => {
			// Arrange - Mix of valid and invalid tags
			const mixedTags = [
				mockTags[0], // Valid: has id, name, and color
				new Tag("", "Invalid ID", TagColors.Red, []), // Invalid: empty ID
				new Tag("123e4567-e89b-12d3-a456-426614174003", "", TagColors.Blue, []), // Invalid: empty name
				new Tag(
					"123e4567-e89b-12d3-a456-426614174004",
					"Invalid Color",
					null as unknown as TagColors,
					[],
				), // Invalid: null color
				mockTags[1], // Valid: has id, name, and color
			];
			vi.mocked(mockRepository.findAll).mockResolvedValue(mixedTags);

			// Act
			const result = await useCase.execute();

			// Assert - Should return only the 2 valid tags, filtered and sorted
			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("Basic"); // mockTags[1] sorted first
			expect(result[1].name).toBe("Premium"); // mockTags[0] sorted second
		});

		it("should propagate repository errors", async () => {
			// Arrange
			const repositoryError = new Error("Repository connection failed");
			vi.mocked(mockRepository.findAll).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute()).rejects.toThrow(
				"Repository connection failed",
			);
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
		});
	});

	describe("filtering operations", () => {
		beforeEach(() => {
			vi.mocked(mockRepository.findAll).mockResolvedValue(mockTags);
		});

		it("should return all tags without filtering", async () => {
			// Arrange & Act
			const allTags = await useCase.execute();

			// Assert
			expect(allTags).toHaveLength(3);
			expect(allTags.map((tag) => tag.name)).toEqual([
				"Basic",
				"Newsletter",
				"Premium",
			]);
		});
	});

	describe("error handling", () => {
		it("should handle network timeout errors", async () => {
			// Arrange
			const timeoutError = new Error("Network timeout");
			timeoutError.name = "TimeoutError";
			vi.mocked(mockRepository.findAll).mockRejectedValue(timeoutError);

			// Act & Assert
			await expect(useCase.execute()).rejects.toThrow("Network timeout");
		});

		it("should handle database connection errors", async () => {
			// Arrange
			const dbError = new Error("Database connection failed");
			dbError.name = "DatabaseError";
			vi.mocked(mockRepository.findAll).mockRejectedValue(dbError);

			// Act & Assert
			await expect(useCase.execute()).rejects.toThrow(
				"Database connection failed",
			);
		});

		it("should handle unexpected data format from repository", async () => {
			// Arrange - Repository returns non-array data
			vi.mocked(mockRepository.findAll).mockResolvedValue(
				"invalid data" as unknown as Tag[],
			);

			// Act & Assert - Should throw a specific error for non-array data
			await expect(useCase.execute()).rejects.toThrow(
				expect.objectContaining({
					message: expect.stringContaining("invalid data format"),
				}),
			);
		});
	});

	describe("performance considerations", () => {
		it("should handle large number of tags efficiently", async () => {
			// Arrange - Create a large dataset with varied names for sorting test
			const largeMockData: Tag[] = [];
			for (let i = 0; i < 1000; i++) {
				largeMockData.push(
					new Tag(
						`tag-${i.toString().padStart(4, "0")}`, // Consistent ID format
						`Tag ${(999 - i).toString().padStart(4, "0")}`, // Reverse order names to test sorting
						TagColors.Blue,
						[],
						"2024-01-01T00:00:00Z",
						"2024-01-01T00:00:00Z",
					),
				);
			}
			vi.mocked(mockRepository.findAll).mockResolvedValue(largeMockData);

			// Act
			const result = await useCase.execute();

			// Assert - Focus on correctness rather than timing
			expect(result).toHaveLength(1000);
			// Verify sorting is maintained even with large datasets
			expect(result[0].name).toBe("Tag 0000");
			expect(result[999].name).toBe("Tag 0999");
			// Verify all tags are properly sorted
			for (let i = 1; i < result.length; i++) {
				expect(
					result[i].name.localeCompare(result[i - 1].name),
				).toBeGreaterThan(0);
			}
		});

		it("should maintain consistent sorting for identical names", async () => {
			// Arrange - Tags with identical names but different IDs
			const identicalNameTags = [
				new Tag("id1", "Identical", TagColors.Red, []),
				new Tag("id2", "Identical", TagColors.Blue, []),
				new Tag("id3", "Identical", TagColors.Green, []),
			];
			vi.mocked(mockRepository.findAll).mockResolvedValue(identicalNameTags);

			// Act - Execute multiple times
			const result1 = await useCase.execute();
			const result2 = await useCase.execute();

			// Assert - Order should be consistent
			expect(result1.map((t) => t.id)).toEqual(result2.map((t) => t.id));
		});
	});

	describe("business logic validation", () => {
		it("should preserve subscriber data during fetch", async () => {
			// Arrange
			const tagWithSubscribers = new Tag(
				"sub-test",
				"Subscriber Test",
				TagColors.Yellow,
				["user1", "user2", "user3"],
				"2024-01-01T00:00:00Z",
				"2024-01-01T00:00:00Z",
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue([tagWithSubscribers]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result[0].subscribers).toHaveLength(3);
			expect(result[0].subscriberCount).toBe(3);
		});

		it("should handle tags with string-based subscriber counts", async () => {
			// Arrange
			const tagWithStringSubscribers = new Tag(
				"string-sub",
				"String Subscribers",
				TagColors.Purple,
				"5", // String representation of subscriber count
				"2024-01-01T00:00:00Z",
				"2024-01-01T00:00:00Z",
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue([
				tagWithStringSubscribers,
			]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result[0].subscriberCount).toBe(5);
		});

		it("should validate tag color classes are computed correctly", async () => {
			// Arrange - Use all available colors
			const colorTags = Object.values(TagColors).map(
				(color, index) =>
					new Tag(
						`color-${index}`,
						`Color ${color}`,
						color,
						[],
						"2024-01-01T00:00:00Z",
						"2024-01-01T00:00:00Z",
					),
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue(colorTags);

			// Act
			const result = await useCase.execute();

			// Assert
			result.forEach((tag) => {
				expect(tag.colorClass).toBeTruthy();
				expect(tag.colorClass).toMatch(/^bg-\w+-500$/);
			});
		});
	});

	describe("additional use case methods", () => {
		beforeEach(() => {
			vi.mocked(mockRepository.findAll).mockResolvedValue(mockTags);
		});

		it("should return correct total count", async () => {
			// Act
			const count = await useCase.getTotalCount();

			// Assert
			expect(count).toBe(3);
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
		});

		it("should filter tags by color correctly", async () => {
			// Act
			const redTags = await useCase.findByColor(TagColors.Red);

			// Assert
			expect(redTags).toHaveLength(1);
			expect(redTags[0].color).toBe(TagColors.Red);
			expect(redTags[0].name).toBe("Premium");
		});

		it("should return empty array when no tags match color filter", async () => {
			// Act
			const orangeTags = await useCase.findByColor("orange" as TagColors);

			// Assert
			expect(orangeTags).toHaveLength(0);
		});

		it("should handle invalid color filter input", async () => {
			// Act & Assert
			expect(await useCase.findByColor("")).toHaveLength(0);
			expect(await useCase.findByColor("   ")).toHaveLength(0);
			expect(await useCase.findByColor(null as unknown as string)).toHaveLength(
				0,
			);
			expect(
				await useCase.findByColor(undefined as unknown as string),
			).toHaveLength(0);
		});
	});

	describe("edge cases", () => {
		it("should handle tags with very long names", async () => {
			// Arrange
			const longName = "A".repeat(1000);
			const longNameTag = new Tag(
				"long-name",
				longName,
				TagColors.Gray,
				[],
				"2024-01-01T00:00:00Z",
				"2024-01-01T00:00:00Z",
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue([longNameTag]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result[0].name).toHaveLength(1000);
			expect(result[0].name).toBe(longName);
		});

		it("should handle tags with special characters in names", async () => {
			// Arrange
			const specialCharTag = new Tag(
				"special-char",
				"Special!@#$%^&*()_+-=[]{}|;:,.<>?",
				TagColors.Green,
				[],
				"2024-01-01T00:00:00Z",
				"2024-01-01T00:00:00Z",
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue([specialCharTag]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result[0].name).toBe("Special!@#$%^&*()_+-=[]{}|;:,.<>?");
		});

		it("should handle tags with Unicode characters", async () => {
			// Arrange
			const unicodeTag = new Tag(
				"unicode",
				"标签 🏷️ тег العلامة",
				TagColors.Blue,
				[],
				"2024-01-01T00:00:00Z",
				"2024-01-01T00:00:00Z",
			);
			vi.mocked(mockRepository.findAll).mockResolvedValue([unicodeTag]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result[0].name).toBe("标签 🏷️ тег العلامة");
		});
	});
});
