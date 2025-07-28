/**
 * Tests for Zod validation schemas
 * Validates schema behavior for valid and invalid inputs
 */

import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { SubscriberStatus } from "@/subscribers";
import {
	attributesSchema,
	countByStatusArraySchema,
	countByStatusResponseSchema,
	countByTagsArraySchema,
	countByTagsResponseSchema,
	subscriberSchema,
	subscriberStatusSchema,
	subscribersArraySchema,
} from "./schemas";

describe("subscriberStatusSchema", () => {
	it("should validate valid status values", () => {
		expect(subscriberStatusSchema.parse("ENABLED")).toBe("ENABLED");
		expect(subscriberStatusSchema.parse("DISABLED")).toBe("DISABLED");
		expect(subscriberStatusSchema.parse("BLOCKLISTED")).toBe("BLOCKLISTED");
	});

	it("should reject invalid status values", () => {
		expect(() => subscriberStatusSchema.parse("INVALID")).toThrow(ZodError);
		expect(() => subscriberStatusSchema.parse("")).toThrow(ZodError);
		expect(() => subscriberStatusSchema.parse(null)).toThrow(ZodError);
	});
});

describe("attributesSchema", () => {
	it("should validate valid attributes", () => {
		const validAttributes = {
			name: "John Doe",
			age: 30,
			isActive: true,
			tags: ["premium", "newsletter"],
		};

		const result = attributesSchema.parse(validAttributes);
		expect(result).toEqual(validAttributes);
	});

	it("should accept undefined attributes and default to empty object", () => {
		const result = attributesSchema.parse(undefined);
		expect(result).toEqual({});
	});

	it("should accept empty attributes object", () => {
		const result = attributesSchema.parse({});
		expect(result).toEqual({});
	});

	it("should reject invalid attribute values", () => {
		const invalidAttributes = {
			name: "John",
			invalidValue: { nested: "object" }, // Objects are not allowed
		};

		expect(() => attributesSchema.parse(invalidAttributes)).toThrow(ZodError);
	});
});

describe("subscriberSchema", () => {
	const validSubscriber = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		email: "test@example.com",
		name: "Test User",
		status: SubscriberStatus.ENABLED,
		workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: new Date(),
	};

	it("should validate valid subscriber data", () => {
		const expected = { ...validSubscriber, attributes: {} };
		const result = subscriberSchema.parse(validSubscriber);
		expect(result).toEqual(expected);
	});

	it("should validate minimal subscriber data", () => {
		const minimalSubscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};
		const expected = { ...minimalSubscriber, attributes: {} };
		const result = subscriberSchema.parse(minimalSubscriber);
		expect(result).toEqual(expected);
	});

	it("should validate subscriber with attributes", () => {
		const subscriberWithAttributes = {
			...validSubscriber,
			attributes: {
				firstName: "John",
				age: 30,
				tags: ["premium"],
			},
		};

		const result = subscriberSchema.parse(subscriberWithAttributes);
		expect(result).toEqual(subscriberWithAttributes);
	});

	it("should reject invalid UUID format for id", () => {
		const invalidSubscriber = {
			...validSubscriber,
			id: "invalid-uuid",
		};

		expect(() => subscriberSchema.parse(invalidSubscriber)).toThrow(ZodError);
	});

	it("should reject invalid email format", () => {
		const invalidSubscriber = {
			...validSubscriber,
			email: "invalid-email",
		};

		expect(() => subscriberSchema.parse(invalidSubscriber)).toThrow(ZodError);
	});

	it("should reject invalid UUID format for workspaceId", () => {
		const invalidSubscriber = {
			...validSubscriber,
			workspaceId: "invalid-workspace-id",
		};

		expect(() => subscriberSchema.parse(invalidSubscriber)).toThrow(ZodError);
	});

	it("should reject invalid status", () => {
		const invalidSubscriber = {
			...validSubscriber,
			status: "INVALID_STATUS",
		};

		expect(() => subscriberSchema.parse(invalidSubscriber)).toThrow(ZodError);
	});

	it("should reject missing required fields", () => {
		const incompleteSubscriber = {
			email: "test@example.com",
			// Missing id, status, workspaceId
		};

		expect(() => subscriberSchema.parse(incompleteSubscriber)).toThrow(
			ZodError,
		);
	});
});

describe("countByStatusResponseSchema", () => {
	it("should validate valid count by status response", () => {
		const validResponse = {
			count: 42,
			status: "ENABLED",
		};

		const result = countByStatusResponseSchema.parse(validResponse);
		expect(result).toEqual(validResponse);
	});

	it("should reject negative count", () => {
		const invalidResponse = {
			count: -1,
			status: "ENABLED",
		};

		expect(() => countByStatusResponseSchema.parse(invalidResponse)).toThrow(
			ZodError,
		);
	});

	it("should reject empty status", () => {
		const invalidResponse = {
			count: 42,
			status: "",
		};

		expect(() => countByStatusResponseSchema.parse(invalidResponse)).toThrow(
			ZodError,
		);
	});

	it("should reject non-integer count", () => {
		const invalidResponse = {
			count: 42.5,
			status: "ENABLED",
		};

		expect(() => countByStatusResponseSchema.parse(invalidResponse)).toThrow(
			ZodError,
		);
	});
});

describe("countByTagsResponseSchema", () => {
	it("should validate valid count by tags response", () => {
		const validResponse = {
			count: 15,
			tag: "premium",
		};

		const result = countByTagsResponseSchema.parse(validResponse);
		expect(result).toEqual(validResponse);
	});

	it("should reject negative count", () => {
		const invalidResponse = {
			count: -5,
			tag: "premium",
		};

		expect(() => countByTagsResponseSchema.parse(invalidResponse)).toThrow(
			ZodError,
		);
	});

	it("should reject empty tag", () => {
		const invalidResponse = {
			count: 15,
			tag: "",
		};

		expect(() => countByTagsResponseSchema.parse(invalidResponse)).toThrow(
			ZodError,
		);
	});
});

describe("array schemas", () => {
	it("should validate subscribers array", () => {
		const subscribers = [
			{
				id: "123e4567-e89b-12d3-a456-426614174000",
				email: "test1@example.com",
				status: SubscriberStatus.ENABLED,
				workspaceId: "123e4567-e89b-12d3-a456-426614174001",
			},
			{
				id: "123e4567-e89b-12d3-a456-426614174002",
				email: "test2@example.com",
				status: SubscriberStatus.DISABLED,
				workspaceId: "123e4567-e89b-12d3-a456-426614174001",
			},
		];
		const expected = subscribers.map((s) => ({ ...s, attributes: {} }));
		const result = subscribersArraySchema.parse(subscribers);
		expect(result).toEqual(expected);
	});

	it("should validate count by status array", () => {
		const counts = [
			{ count: 10, status: "ENABLED" },
			{ count: 5, status: "DISABLED" },
		];

		const result = countByStatusArraySchema.parse(counts);
		expect(result).toEqual(counts);
	});

	it("should validate count by tags array", () => {
		const counts = [
			{ count: 20, tag: "premium" },
			{ count: 15, tag: "newsletter" },
		];

		const result = countByTagsArraySchema.parse(counts);
		expect(result).toEqual(counts);
	});

	it("should validate empty arrays", () => {
		expect(subscribersArraySchema.parse([])).toEqual([]);
		expect(countByStatusArraySchema.parse([])).toEqual([]);
		expect(countByTagsArraySchema.parse([])).toEqual([]);
	});
});
