/**
 * Tests for Tag domain model
 * Validates Tag class methods and behavior
 */

import { describe, expect, it } from "vitest";
import { Tag } from "./Tag.ts";
import { TagColors } from "./TagColors.ts";
import type { TagResponse } from "./TagResponse.ts";

describe("Tag", () => {
	// Test constants
	const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
	const SAMPLE_TIMESTAMP = "2024-01-01T00:00:00Z";
	const UPDATED_TIMESTAMP = "2024-01-01T12:00:00Z";
	const LARGE_SUBSCRIBER_COUNT = 999999;
	const MEDIUM_SUBSCRIBER_COUNT = 42;

	// Test data factories
	const createMockTagResponse = (
		overrides: Partial<TagResponse> = {},
	): TagResponse => ({
		id: VALID_UUID,
		name: "Premium",
		color: "red",
		subscribers: ["sub1", "sub2", "sub3"],
		createdAt: SAMPLE_TIMESTAMP,
		updatedAt: UPDATED_TIMESTAMP,
		...overrides,
	});

	const createTag = (
		overrides: Partial<{
			id: string;
			name: string;
			color: TagColors;
			subscribers: ReadonlyArray<string> | string;
			createdAt?: Date | string;
			updatedAt?: Date | string;
		}> = {},
	): Tag => {
		const defaults = {
			id: VALID_UUID,
			name: "Test Tag",
			color: TagColors.Red,
			subscribers: [] as ReadonlyArray<string>,
			createdAt: undefined,
			updatedAt: undefined,
		};
		const merged = { ...defaults, ...overrides };
		return new Tag(
			merged.id,
			merged.name,
			merged.color,
			merged.subscribers,
			merged.createdAt,
			merged.updatedAt,
		);
	};

	describe("constructor", () => {
		it("should create tag with all properties", () => {
			const createdAt = new Date(SAMPLE_TIMESTAMP);
			const subscribers = ["sub1", "sub2"];

			const tag = new Tag(
				VALID_UUID,
				"Premium",
				TagColors.Red,
				subscribers,
				createdAt,
				UPDATED_TIMESTAMP,
			);

			expect(tag).toMatchObject({
				id: VALID_UUID,
				name: "Premium",
				color: TagColors.Red,
				subscribers,
				createdAt,
				updatedAt: UPDATED_TIMESTAMP,
			});
		});

		it("should create tag with minimal properties", () => {
			const tag = createTag({
				name: "Basic",
				color: TagColors.Blue,
				subscribers: [],
			});

			expect(tag).toMatchObject({
				id: VALID_UUID,
				name: "Basic",
				color: TagColors.Blue,
				subscribers: [],
			});
			expect(tag.createdAt).toBeUndefined();
			expect(tag.updatedAt).toBeUndefined();
		});

		it("should create tag with string subscriber count", () => {
			const tag = createTag({
				name: "Newsletter",
				color: TagColors.Green,
				subscribers: MEDIUM_SUBSCRIBER_COUNT.toString(),
			});

			expect(tag.subscribers).toBe(MEDIUM_SUBSCRIBER_COUNT.toString());
		});
	});

	describe("fromResponse", () => {
		it("should create tag from API response with array subscribers", () => {
			const mockResponse = createMockTagResponse();
			const tag = Tag.fromResponse(mockResponse);

			expect(tag).toMatchObject({
				id: mockResponse.id,
				name: mockResponse.name,
				color: TagColors.Red,
				subscribers: mockResponse.subscribers,
				createdAt: mockResponse.createdAt,
				updatedAt: mockResponse.updatedAt,
			});
		});

		it("should create tag from API response with string subscriber count", () => {
			const response = createMockTagResponse({
				subscribers: "25",
			});

			const tag = Tag.fromResponse(response);

			expect(tag.subscribers).toBe("25");
		});

		it("should create tag from API response without timestamps", () => {
			const response = createMockTagResponse({
				name: "Simple",
				color: "blue",
				subscribers: [],
				createdAt: undefined,
				updatedAt: undefined,
			});

			const tag = Tag.fromResponse(response);

			expect(tag).toMatchObject({
				id: response.id,
				name: "Simple",
				color: TagColors.Blue,
				subscribers: [],
			});
			expect(tag.createdAt).toBeUndefined();
			expect(tag.updatedAt).toBeUndefined();
		});

		it("should handle all tag colors correctly", () => {
			const colors = Object.values(TagColors);

			colors.forEach((color) => {
				const response = createMockTagResponse({ color });
				const tag = Tag.fromResponse(response);

				expect(tag.color).toBe(color);
			});
		});
	});

	describe("colorClass getter", () => {
		it("should return correct CSS class for each color", () => {
			const testCases = [
				{ color: TagColors.Red, expected: "bg-red-500" },
				{ color: TagColors.Green, expected: "bg-green-500" },
				{ color: TagColors.Blue, expected: "bg-blue-500" },
				{ color: TagColors.Yellow, expected: "bg-yellow-500" },
				{ color: TagColors.Purple, expected: "bg-purple-500" },
				{ color: TagColors.Gray, expected: "bg-gray-500" },
			];

			testCases.forEach(({ color, expected }) => {
				const tag = createTag({ color });
				expect(tag.colorClass).toBe(expected);
			});
		});
	});

	describe("subscriberCount getter", () => {
		it("should return array length when subscribers is array", () => {
			const subscribers = ["sub1", "sub2", "sub3"];
			const tag = createTag({ subscribers });

			expect(tag.subscriberCount).toBe(subscribers.length);
		});

		it("should return 0 when subscribers is empty array", () => {
			const tag = createTag({ subscribers: [] });

			expect(tag.subscriberCount).toBe(0);
		});

		it("should parse string count when subscribers is string", () => {
			const tag = createTag({
				subscribers: MEDIUM_SUBSCRIBER_COUNT.toString(),
			});

			expect(tag.subscriberCount).toBe(MEDIUM_SUBSCRIBER_COUNT);
		});

		it("should handle string zero count", () => {
			const tag = createTag({ subscribers: "0" });

			expect(tag.subscriberCount).toBe(0);
		});

		it("should handle large string counts", () => {
			const tag = createTag({
				subscribers: LARGE_SUBSCRIBER_COUNT.toString(),
			});

			expect(tag.subscriberCount).toBe(LARGE_SUBSCRIBER_COUNT);
		});

		it("should handle invalid string counts gracefully", () => {
			const tag = createTag({ subscribers: "invalid" });

			expect(tag.subscriberCount).toBe(0);
		});

		it("should handle empty string counts", () => {
			const tag = createTag({ subscribers: "" });

			expect(tag.subscriberCount).toBe(0);
		});

		it("should handle whitespace-only string counts", () => {
			const tag = createTag({ subscribers: "   " });

			expect(tag.subscriberCount).toBe(0);
		});
	});

	describe("immutability", () => {
		it("should preserve readonly nature of subscribers array", () => {
			const subscribers = ["sub1", "sub2"];
			const tag = createTag({ subscribers });

			// TypeScript should prevent modification at compile time
			// Runtime behavior: ReadonlyArray is just a type annotation
			expect(Array.isArray(tag.subscribers)).toBe(true);
			expect(tag.subscribers).toEqual(subscribers);

			// Verify the array reference is the same (shallow immutability)
			expect(tag.subscribers).toBe(subscribers);
		});
	});

	describe("edge cases", () => {
		const LONG_NAME_LENGTH = 100;

		it("should handle very long tag names", () => {
			const longName = "A".repeat(LONG_NAME_LENGTH);
			const tag = createTag({ name: longName });

			expect(tag.name).toBe(longName);
			expect(tag.name).toHaveLength(LONG_NAME_LENGTH);
		});

		it("should handle empty tag name", () => {
			const tag = createTag({ name: "" });

			expect(tag.name).toBe("");
		});

		it("should handle special characters in tag name", () => {
			const specialName = "Tag with émojis 🏷️ & symbols!";
			const tag = createTag({ name: specialName });

			expect(tag.name).toBe(specialName);
		});
	});
});
