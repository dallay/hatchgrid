/**
 * Tests for Zod validation schemas
 * Validates schema behavior for valid and invalid inputs
 */

import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
	createTagRequestSchema,
	parseCreateTagRequest,
	parseTag,
	parseTagResponse,
	parseUpdateTagRequest,
	safeParseTag,
	safeParseTagResponse,
	TAG_VALIDATION_CONSTANTS,
	tagColorsSchema,
	tagResponseSchema,
	tagResponsesArraySchema,
	tagSchema,
	tagsArraySchema,
	updateTagRequestSchema,
} from "./schemas.ts";
import { TagColors } from "./TagColors.ts";

describe("TAG_VALIDATION_CONSTANTS", () => {
	it("should have correct validation constants", () => {
		expect(TAG_VALIDATION_CONSTANTS.NAME_MIN_LENGTH).toBe(1);
		expect(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH).toBe(50);
	});
});

describe("tagColorsSchema", () => {
	it("should validate valid tag colors", () => {
		expect(tagColorsSchema.parse(TagColors.Red)).toBe("red");
		expect(tagColorsSchema.parse(TagColors.Green)).toBe("green");
		expect(tagColorsSchema.parse(TagColors.Blue)).toBe("blue");
		expect(tagColorsSchema.parse(TagColors.Yellow)).toBe("yellow");
		expect(tagColorsSchema.parse(TagColors.Purple)).toBe("purple");
		expect(tagColorsSchema.parse(TagColors.Gray)).toBe("gray");
	});

	it("should reject invalid color values", () => {
		expect(() => tagColorsSchema.parse("invalid")).toThrow(ZodError);
		expect(() => tagColorsSchema.parse("")).toThrow(ZodError);
		expect(() => tagColorsSchema.parse(null)).toThrow(ZodError);
		expect(() => tagColorsSchema.parse(undefined)).toThrow(ZodError);
	});
});

describe("tagSchema", () => {
	const validTag = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		name: "Premium",
		color: TagColors.Red,
		subscribers: [
			"123e4567-e89b-12d3-a456-426614174001",
			"123e4567-e89b-12d3-a456-426614174002",
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: new Date("2024-01-01T12:00:00Z"),
	};

	it("should validate valid tag data", () => {
		const result = tagSchema.parse(validTag);
		expect(result).toEqual(validTag);
	});

	it("should validate minimal tag data", () => {
		const minimalTag = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Basic",
			color: TagColors.Blue,
			subscribers: [],
		};

		const result = tagSchema.parse(minimalTag);
		expect(result).toEqual(minimalTag);
	});

	it("should validate tag with string subscriber count", () => {
		const tagWithStringCount = {
			...validTag,
			subscribers: "42",
		};

		const result = tagSchema.parse(tagWithStringCount);
		expect(result).toEqual(tagWithStringCount);
	});

	it("should reject invalid UUID format for id", () => {
		const invalidTag = {
			...validTag,
			id: "invalid-uuid",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should reject empty tag name", () => {
		const invalidTag = {
			...validTag,
			name: "",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should reject tag name that is too long", () => {
		const invalidTag = {
			...validTag,
			name: "A".repeat(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH + 1),
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should accept tag name at maximum length", () => {
		const validTag = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "A".repeat(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH),
			color: TagColors.Red,
			subscribers: [],
		};

		const result = tagSchema.parse(validTag);
		expect(result.name).toHaveLength(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH);
	});

	it("should reject invalid color", () => {
		const invalidTag = {
			...validTag,
			color: "invalid-color",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should reject invalid subscriber array with non-UUID strings", () => {
		const invalidTag = {
			...validTag,
			subscribers: ["invalid-uuid", "another-invalid"],
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should reject invalid subscriber string count", () => {
		const invalidTag = {
			...validTag,
			subscribers: "not-a-number",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow(ZodError);
	});

	it("should accept valid subscriber string count", () => {
		const validTag = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test",
			color: TagColors.Red,
			subscribers: "123",
		};

		const result = tagSchema.parse(validTag);
		expect(result.subscribers).toBe("123");
	});

	it("should reject missing required fields", () => {
		const incompleteTag = {
			name: "Test",
			// Missing id, color, subscribers
		};

		expect(() => tagSchema.parse(incompleteTag)).toThrow(ZodError);
	});

	it("should return custom error message for invalid UUID", () => {
		const invalidTag = {
			...validTag,
			id: "invalid-uuid",
		};

		try {
			tagSchema.parse(invalidTag);
			expect.fail("Should have thrown ZodError");
		} catch (error: unknown) {
			expect(error).toBeInstanceOf(ZodError);
			if (error instanceof ZodError) {
				const messages = error.issues?.map((e) => e.message) || [];
				expect(messages).toContain("tag.validation.id.invalid");
			}
		}
	});

	it("should return custom error message for invalid name length", () => {
		const invalidTag = {
			...validTag,
			name: "",
		};

		try {
			tagSchema.parse(invalidTag);
			expect.fail("Should have thrown ZodError");
		} catch (error: unknown) {
			expect(error).toBeInstanceOf(ZodError);
			if (error instanceof ZodError) {
				const messages = error.issues?.map((e) => e.message) || [];
				expect(messages).toContain("tag.validation.name.empty");
			}
		}
	});
});

describe("tagResponseSchema", () => {
	const validResponse = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		name: "Premium",
		color: TagColors.Red,
		subscribers: [
			"123e4567-e89b-12d3-a456-426614174001",
			"123e4567-e89b-12d3-a456-426614174002",
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T12:00:00Z",
	};

	it("should validate valid tag response", () => {
		const result = tagResponseSchema.parse(validResponse);
		expect(result).toEqual(validResponse);
	});

	it("should validate response without timestamps", () => {
		const responseWithoutTimestamps = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Basic",
			color: TagColors.Blue,
			subscribers: [],
		};

		const result = tagResponseSchema.parse(responseWithoutTimestamps);
		expect(result).toEqual(responseWithoutTimestamps);
	});

	it("should validate response with string subscriber count", () => {
		const responseWithStringCount = {
			...validResponse,
			subscribers: "25",
		};

		const result = tagResponseSchema.parse(responseWithStringCount);
		expect(result).toEqual(responseWithStringCount);
	});

	it("should reject invalid timestamp format", () => {
		const invalidResponse = {
			...validResponse,
			createdAt: "invalid-date",
		};

		expect(() => tagResponseSchema.parse(invalidResponse)).toThrow(ZodError);
	});
});

describe("createTagRequestSchema", () => {
	it("should validate valid create request", () => {
		const validRequest = {
			name: "New Tag",
			color: TagColors.Green,
		};

		const result = createTagRequestSchema.parse(validRequest);
		expect(result).toEqual(validRequest);
	});

	it("should reject request with missing name", () => {
		const invalidRequest = {
			color: TagColors.Green,
		};

		expect(() => createTagRequestSchema.parse(invalidRequest)).toThrow(
			ZodError,
		);
	});

	it("should reject request with missing color", () => {
		const invalidRequest = {
			name: "New Tag",
		};

		expect(() => createTagRequestSchema.parse(invalidRequest)).toThrow(
			ZodError,
		);
	});

	it("should reject request with invalid name length", () => {
		const invalidRequest = {
			name: "A".repeat(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH + 1),
			color: TagColors.Green,
		};

		expect(() => createTagRequestSchema.parse(invalidRequest)).toThrow(
			ZodError,
		);
	});
});

describe("updateTagRequestSchema", () => {
	it("should validate valid update request with name only", () => {
		const validRequest = {
			name: "Updated Tag",
		};

		const result = updateTagRequestSchema.parse(validRequest);
		expect(result).toEqual(validRequest);
	});

	it("should validate valid update request with color only", () => {
		const validRequest = {
			color: TagColors.Purple,
		};

		const result = updateTagRequestSchema.parse(validRequest);
		expect(result).toEqual(validRequest);
	});

	it("should validate valid update request with both fields", () => {
		const validRequest = {
			name: "Updated Tag",
			color: TagColors.Yellow,
		};

		const result = updateTagRequestSchema.parse(validRequest);
		expect(result).toEqual(validRequest);
	});

	it("should validate empty update request", () => {
		const emptyRequest = {};

		const result = updateTagRequestSchema.parse(emptyRequest);
		expect(result).toEqual(emptyRequest);
	});

	it("should reject invalid name length", () => {
		const invalidRequest = {
			name: "A".repeat(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH + 1),
		};

		expect(() => updateTagRequestSchema.parse(invalidRequest)).toThrow(
			ZodError,
		);
	});

	it("should reject invalid color", () => {
		const invalidRequest = {
			color: "invalid-color",
		};

		expect(() => updateTagRequestSchema.parse(invalidRequest)).toThrow(
			ZodError,
		);
	});
});

describe("array schemas", () => {
	it("should validate tags array", () => {
		const tags = [
			{
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Tag 1",
				color: TagColors.Red,
				subscribers: ["123e4567-e89b-12d3-a456-426614174003"],
			},
			{
				id: "123e4567-e89b-12d3-a456-426614174001",
				name: "Tag 2",
				color: TagColors.Blue,
				subscribers: "5",
			},
		];

		const result = tagsArraySchema.parse(tags);
		expect(result).toEqual(tags);
	});

	it("should validate tag responses array", () => {
		const responses = [
			{
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Tag 1",
				color: TagColors.Red,
				subscribers: ["123e4567-e89b-12d3-a456-426614174003"],
				createdAt: "2024-01-01T00:00:00Z",
			},
			{
				id: "123e4567-e89b-12d3-a456-426614174001",
				name: "Tag 2",
				color: TagColors.Blue,
				subscribers: "5",
			},
		];

		const result = tagResponsesArraySchema.parse(responses);
		expect(result).toEqual(responses);
	});

	it("should validate empty arrays", () => {
		expect(tagsArraySchema.parse([])).toEqual([]);
		expect(tagResponsesArraySchema.parse([])).toEqual([]);
	});

	it("should reject array with invalid tag", () => {
		const invalidTags = [
			{
				id: "invalid-uuid",
				name: "Tag 1",
				color: TagColors.Red,
				subscribers: [],
			},
		];

		expect(() => tagsArraySchema.parse(invalidTags)).toThrow(ZodError);
	});
});

describe("parsing utility functions", () => {
	const validTag = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		name: "Test Tag",
		color: TagColors.Red,
		subscribers: [],
	};

	describe("parseTag", () => {
		it("should parse valid tag data", () => {
			const result = parseTag(validTag);
			expect(result).toEqual(validTag);
		});

		it("should throw on invalid tag data", () => {
			const invalidTag = { ...validTag, id: "invalid" };
			expect(() => parseTag(invalidTag)).toThrow(ZodError);
		});
	});

	describe("parseTagResponse", () => {
		it("should parse valid tag response data", () => {
			const result = parseTagResponse(validTag);
			expect(result).toEqual(validTag);
		});

		it("should throw on invalid tag response data", () => {
			const invalidResponse = { ...validTag, name: "" };
			expect(() => parseTagResponse(invalidResponse)).toThrow(ZodError);
		});
	});

	describe("parseCreateTagRequest", () => {
		it("should parse valid create request", () => {
			const request = { name: "New Tag", color: TagColors.Green };
			const result = parseCreateTagRequest(request);
			expect(result).toEqual(request);
		});

		it("should throw on invalid create request", () => {
			const invalidRequest = { name: "New Tag" }; // missing color
			expect(() => parseCreateTagRequest(invalidRequest)).toThrow(ZodError);
		});
	});

	describe("parseUpdateTagRequest", () => {
		it("should parse valid update request", () => {
			const request = { name: "Updated Tag" };
			const result = parseUpdateTagRequest(request);
			expect(result).toEqual(request);
		});

		it("should throw on invalid update request", () => {
			const invalidRequest = { name: "" }; // empty name
			expect(() => parseUpdateTagRequest(invalidRequest)).toThrow(ZodError);
		});
	});

	describe("safeParseTag", () => {
		it("should return success for valid tag data", () => {
			const result = safeParseTag(validTag);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validTag);
			}
		});

		it("should return error for invalid tag data", () => {
			const invalidTag = { ...validTag, id: "invalid" };
			const result = safeParseTag(invalidTag);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError);
			}
		});
	});

	describe("safeParseTagResponse", () => {
		it("should return success for valid tag response data", () => {
			const result = safeParseTagResponse(validTag);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validTag);
			}
		});

		it("should return error for invalid tag response data", () => {
			const invalidResponse = { ...validTag, name: "" };
			const result = safeParseTagResponse(invalidResponse);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError);
			}
		});
	});
});

describe("type inference", () => {
	it("should infer correct types from schemas", () => {
		// These tests verify TypeScript type inference works correctly
		// The actual validation is done by the schema tests above

		const tag = tagSchema.parse({
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test",
			color: TagColors.Red,
			subscribers: [],
		});

		// TypeScript should infer these types correctly
		expect(typeof tag.id).toBe("string");
		expect(typeof tag.name).toBe("string");
		expect(typeof tag.color).toBe("string");
		expect(
			Array.isArray(tag.subscribers) || typeof tag.subscribers === "string",
		).toBe(true);
	});
});
