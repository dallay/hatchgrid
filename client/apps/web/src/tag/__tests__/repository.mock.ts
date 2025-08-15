/**
 * Mock repository for testing
 * Provides a complete mock implementation of TagRepository for testing purposes
 */

import { vi } from "vitest";
import { Tag } from "../domain/models/Tag.ts";
import { TagColors } from "../domain/models/TagColors.ts";
import type {
	CreateTagRepositoryRequest,
	TagRepository,
} from "../domain/repositories/TagRepository.ts";

/**
 * Helper function to normalize tag names for comparison
 * @param name - The tag name to normalize
 * @returns Normalized name (trimmed and lowercase)
 */
const normalizeTagName = (name: string): string => name.trim().toLowerCase();

/**
 * Helper function to check if a tag name exists in a collection
 * @param tags - Array of tags to search
 * @param name - Name to check for existence
 * @param excludeId - Optional ID to exclude from the check
 * @returns True if name exists, false otherwise
 */
const tagNameExists = (
	tags: Tag[],
	name: string,
	excludeId?: string,
): boolean => {
	const normalizedName = normalizeTagName(name);
	return tags.some(
		(tag) =>
			normalizeTagName(tag.name) === normalizedName &&
			(!excludeId || tag.id !== excludeId),
	);
};

/**
 * Create a mock repository with default test data
 * @returns Mock TagRepository instance
 */
export const repositoryMock = (): TagRepository => {
	// Default test data with realistic scenarios
	const defaultTags = [
		new Tag(
			"123e4567-e89b-12d3-a456-426614174000",
			"Premium",
			TagColors.Red,
			["sub1", "sub2", "sub3"],
			"2024-01-01T00:00:00Z",
			"2024-01-01T00:00:00Z",
		),
		new Tag(
			"123e4567-e89b-12d3-a456-426614174001",
			"Basic",
			TagColors.Blue,
			["sub4"],
			"2024-01-02T00:00:00Z",
			"2024-01-02T00:00:00Z",
		),
		new Tag(
			"123e4567-e89b-12d3-a456-426614174002",
			"Newsletter",
			TagColors.Green,
			"25",
			"2024-01-03T00:00:00Z",
			"2024-01-03T00:00:00Z",
		),
		new Tag(
			"123e4567-e89b-12d3-a456-426614174003",
			"VIP",
			TagColors.Purple,
			[],
			"2024-01-04T00:00:00Z",
			"2024-01-04T00:00:00Z",
		),
	];

	return {
		findAll: vi.fn().mockResolvedValue(defaultTags),

		findById: vi.fn().mockImplementation((id: string) => {
			const tag = defaultTags.find((t) => t.id === id);
			return Promise.resolve(tag || null);
		}),

		create: vi.fn().mockImplementation((tagData) => {
			const newTag = new Tag(
				"123e4567-e89b-12d3-a456-426614174999", // New ID
				tagData.name,
				tagData.color,
				tagData.subscribers || [],
				new Date().toISOString(),
				new Date().toISOString(),
			);
			return Promise.resolve(newTag);
		}),

		update: vi.fn().mockImplementation((id: string, updateData) => {
			const existingTag = defaultTags.find((t) => t.id === id);
			if (!existingTag) {
				return Promise.reject(new Error(`Tag with ID ${id} not found`));
			}

			const updatedTag = new Tag(
				id,
				updateData.name || existingTag.name,
				updateData.color || existingTag.color,
				existingTag.subscribers,
				existingTag.createdAt,
				new Date().toISOString(),
			);
			return Promise.resolve(updatedTag);
		}),

		delete: vi.fn().mockResolvedValue(undefined),

		/**
		 * Mock implementation of existsByName
		 * Checks if a tag name exists in the default test data (case-insensitive)
		 */
		existsByName: vi
			.fn()
			.mockImplementation((name: string, excludeId?: string) => {
				return Promise.resolve(tagNameExists(defaultTags, name, excludeId));
			}),
	};
};

/**
 * Create a mock repository with custom test data
 * @param customTags - Custom tags to use instead of defaults
 * @returns Mock TagRepository instance with custom data
 */
export const repositoryMockWithData = (customTags: Tag[]): TagRepository => {
	return {
		findAll: vi.fn().mockResolvedValue(customTags),

		findById: vi.fn().mockImplementation((id: string) => {
			const tag = customTags.find((t) => t.id === id);
			return Promise.resolve(tag || null);
		}),

		create: vi.fn().mockImplementation((tagData) => {
			const newTag = new Tag(
				`new-tag-${Date.now()}`,
				tagData.name,
				tagData.color,
				tagData.subscribers || [],
				new Date().toISOString(),
				new Date().toISOString(),
			);
			customTags.push(newTag);
			return Promise.resolve(newTag);
		}),

		update: vi.fn().mockImplementation((id: string, updateData) => {
			const tagIndex = customTags.findIndex((t) => t.id === id);
			if (tagIndex === -1) {
				return Promise.reject(new Error(`Tag with ID ${id} not found`));
			}

			const existingTag = customTags[tagIndex];
			const updatedTag = new Tag(
				id,
				updateData.name || existingTag.name,
				updateData.color || existingTag.color,
				existingTag.subscribers,
				existingTag.createdAt,
				new Date().toISOString(),
			);
			customTags[tagIndex] = updatedTag;
			return Promise.resolve(updatedTag);
		}),

		delete: vi.fn().mockImplementation((id: string) => {
			const tagIndex = customTags.findIndex((t) => t.id === id);
			if (tagIndex === -1) {
				return Promise.reject(new Error(`Tag with ID ${id} not found`));
			}
			customTags.splice(tagIndex, 1);
			return Promise.resolve(undefined);
		}),

		existsByName: vi
			.fn()
			.mockImplementation((name: string, excludeId?: string) => {
				return Promise.resolve(tagNameExists(customTags, name, excludeId));
			}),
	};
};

/**
 * Create a mock repository that simulates errors
 * @param errorType - Type of error to simulate
 * @returns Mock TagRepository instance that throws errors
 */
export const repositoryMockWithErrors = (
	errorType: "network" | "validation" | "notFound" | "server",
): TagRepository => {
	const getError = () => {
		switch (errorType) {
			case "network":
				return new Error("Network connection failed");
			case "validation":
				return new Error("Validation failed");
			case "notFound":
				return new Error("Tag not found");
			case "server":
				return new Error("Internal server error");
			default:
				return new Error("Unknown error");
		}
	};

	return {
		findAll: vi.fn().mockRejectedValue(getError()),
		findById: vi.fn().mockRejectedValue(getError()),
		create: vi.fn().mockRejectedValue(getError()),
		update: vi.fn().mockRejectedValue(getError()),
		delete: vi.fn().mockRejectedValue(getError()),
		existsByName: vi.fn().mockRejectedValue(getError()),
	};
};

/**
 * Create a mock repository with delayed responses for testing loading states
 * @param delay - Delay in milliseconds
 * @returns Mock TagRepository instance with delayed responses
 */
export const repositoryMockWithDelay = (delay = 1000): TagRepository => {
	const defaultTags = [
		new Tag("123e4567-e89b-12d3-a456-426614174000", "Premium", TagColors.Red, [
			"sub1",
			"sub2",
		]),
	];

	const delayedResponse = <T>(value: T): Promise<T> => {
		return new Promise((resolve) => {
			setTimeout(() => resolve(value), delay);
		});
	};

	return {
		findAll: vi.fn().mockImplementation(() => delayedResponse(defaultTags)),
		findById: vi.fn().mockImplementation((id: string) => {
			const tag = defaultTags.find((t) => t.id === id);
			return delayedResponse(tag || null);
		}),
		create: vi.fn().mockImplementation((tagData) => {
			const newTag = new Tag(
				"new-tag-id",
				tagData.name,
				tagData.color,
				tagData.subscribers || [],
			);
			return delayedResponse(newTag);
		}),
		update: vi.fn().mockImplementation((id: string, updateData) => {
			const existingTag = defaultTags.find((t) => t.id === id);
			if (!existingTag) {
				return Promise.reject(new Error(`Tag with ID ${id} not found`));
			}
			const updatedTag = new Tag(
				id,
				updateData.name || existingTag.name,
				updateData.color || existingTag.color,
				existingTag.subscribers,
			);
			return delayedResponse(updatedTag);
		}),
		delete: vi.fn().mockImplementation(() => delayedResponse(undefined)),
		existsByName: vi
			.fn()
			.mockImplementation((name: string, excludeId?: string) => {
				const exists = tagNameExists(defaultTags, name, excludeId);
				return delayedResponse(exists);
			}),
	};
};

/**
 * Create a mock repository that tracks method calls for testing
 * @returns Mock TagRepository instance with call tracking
 */
export const repositoryMockWithTracking = () => {
	const callLog: Array<{ method: string; args: unknown[]; timestamp: Date }> =
		[];

	const trackCall = (method: string, args: unknown[]) => {
		callLog.push({ method, args, timestamp: new Date() });
	};

	const mock = repositoryMock();

	return {
		...mock,
		findAll: vi.fn().mockImplementation((...args: []) => {
			trackCall("findAll", args);
			return mock.findAll();
		}),
		findById: vi.fn().mockImplementation((...args: [string]) => {
			trackCall("findById", args);
			return mock.findById(...args);
		}),
		create: vi
			.fn()
			.mockImplementation((...args: [CreateTagRepositoryRequest]) => {
				trackCall("create", args);
				return mock.create(...args);
			}),
		update: vi.fn().mockImplementation((...args: [string, Partial<Tag>]) => {
			trackCall("update", args);
			return mock.update(...args);
		}),
		delete: vi.fn().mockImplementation((...args: [string]) => {
			trackCall("delete", args);
			return mock.delete(...args);
		}),
		existsByName: vi.fn().mockImplementation((...args: [string, string?]) => {
			trackCall("existsByName", args);
			return mock.existsByName(...args);
		}),
		getCallLog: () => [...callLog],
		clearCallLog: () => callLog.splice(0, callLog.length),
	};
};

/**
 * Create a mock repository for specific test scenarios
 * @param scenario - Test scenario to simulate
 * @returns Mock TagRepository instance for the scenario
 */
export const repositoryMockForScenario = (
	scenario: "empty" | "large" | "duplicates" | "mixed" | "nameValidation",
): TagRepository => {
	let testData: Tag[] = [];

	switch (scenario) {
		case "empty":
			testData = [];
			break;
		case "large":
			testData = Array.from(
				{ length: 1000 },
				(_, i) =>
					new Tag(
						`tag-${i}`,
						`Tag ${i + 1}`,
						Object.values(TagColors)[i % Object.values(TagColors).length],
						[`sub${i}`],
					),
			);
			break;
		case "duplicates":
			testData = [
				new Tag("1", "Duplicate", TagColors.Red, []),
				new Tag("2", "duplicate", TagColors.Blue, []), // Different case
				new Tag("3", "DUPLICATE", TagColors.Green, []), // Different case
			];
			break;
		case "mixed":
			testData = [
				new Tag("1", "Tag with Array", TagColors.Red, ["sub1", "sub2"]),
				new Tag("2", "Tag with String", TagColors.Blue, "10"),
				new Tag("3", "Tag with Empty", TagColors.Green, []),
				new Tag("4", "Tag with Zero", TagColors.Yellow, "0"),
			];
			break;
		case "nameValidation":
			testData = [
				new Tag("1", "Test Tag", TagColors.Red, []),
				new Tag("2", "  Whitespace  ", TagColors.Blue, []),
				new Tag("3", "UPPERCASE", TagColors.Green, []),
				new Tag("4", "lowercase", TagColors.Yellow, []),
				new Tag("5", "Mixed Case", TagColors.Purple, []),
			];
			break;
	}

	return repositoryMockWithData(testData);
};
