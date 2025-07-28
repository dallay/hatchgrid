/**
 * Tests for domain models index exports
 * Validates that all exports are available and properly typed
 */

import { describe, expect, it } from "vitest";
import {
	type Attributes,
	attributesSchema,
	type CountByStatusResponse,
	type CountByStatusResponseSchemaType,
	type CountByTagsResponse,
	type CountByTagsResponseSchemaType,
	countByStatusArraySchema,
	countByStatusResponseSchema,
	countByTagsArraySchema,
	countByTagsResponseSchema,
	type Subscriber,
	type SubscriberSchemaType,
	SubscriberStatus,
	subscriberSchema,
	subscriberStatusSchema,
	subscribersArraySchema,
} from "./index";

describe("Domain models index exports", () => {
	it("should export all types correctly", () => {
		// Test that types are available (TypeScript compilation test)
		const subscriber: Subscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};

		const attributes: Attributes = {
			name: "Test",
			age: 30,
		};

		const countByStatus: CountByStatusResponse = {
			count: 10,
			status: SubscriberStatus.ENABLED,
		};

		const countByTags: CountByTagsResponse = {
			count: 5,
			tag: "premium",
		};

		expect(subscriber.status).toBe(SubscriberStatus.ENABLED);
		expect(attributes.name).toBe("Test");
		expect(countByStatus.count).toBe(10);
		expect(countByTags.tag).toBe("premium");
	});

	it("should export SubscriberStatus enum values", () => {
		expect(SubscriberStatus.ENABLED).toBe("ENABLED");
		expect(SubscriberStatus.DISABLED).toBe("DISABLED");
		expect(SubscriberStatus.BLOCKLISTED).toBe("BLOCKLISTED");
	});

	it("should export all schemas", () => {
		// Test that schemas are functions/objects
		expect(typeof subscriberSchema.parse).toBe("function");
		expect(typeof subscriberStatusSchema.parse).toBe("function");
		expect(typeof attributesSchema.parse).toBe("function");
		expect(typeof countByStatusResponseSchema.parse).toBe("function");
		expect(typeof countByTagsResponseSchema.parse).toBe("function");
		expect(typeof subscribersArraySchema.parse).toBe("function");
		expect(typeof countByStatusArraySchema.parse).toBe("function");
		expect(typeof countByTagsArraySchema.parse).toBe("function");
	});

	it("should validate data with schemas and handle invalid data", () => {
		// Valid data for each schema
		const validSubscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};
		expect(() => subscriberSchema.parse(validSubscriber)).not.toThrow();

		// Invalid data for subscriberSchema
		const invalidSubscriber = { id: "invalid", email: "not-an-email" };
		expect(() => subscriberSchema.parse(invalidSubscriber)).toThrow();

		// subscriberStatusSchema
		expect(() => subscriberStatusSchema.parse("ENABLED")).not.toThrow();
		expect(() => subscriberStatusSchema.parse("INVALID_STATUS")).toThrow();

		// attributesSchema
		expect(() => attributesSchema.parse({})).not.toThrow();
		expect(() => attributesSchema.parse(null)).toThrow();

		// countByStatusResponseSchema
		expect(() =>
			countByStatusResponseSchema.parse({
				status: SubscriberStatus.ENABLED,
				count: 1,
			}),
		).not.toThrow();
		expect(() =>
			countByStatusResponseSchema.parse({ status: 123, count: "bad" }),
		).toThrow();

		// countByTagsResponseSchema
		expect(() =>
			countByTagsResponseSchema.parse({ tag: "foo", count: 2 }),
		).not.toThrow();
		expect(() =>
			countByTagsResponseSchema.parse({ tag: 123, count: "bad" }),
		).toThrow();

		// subscribersArraySchema
		expect(() => subscribersArraySchema.parse([validSubscriber])).not.toThrow();
		expect(() => subscribersArraySchema.parse([invalidSubscriber])).toThrow();

		// countByStatusArraySchema
		expect(() =>
			countByStatusArraySchema.parse([
				{ status: SubscriberStatus.ENABLED, count: 1 },
			]),
		).not.toThrow();
		expect(() =>
			countByStatusArraySchema.parse([{ status: 123, count: "bad" }]),
		).toThrow();

		// countByTagsArraySchema
		expect(() =>
			countByTagsArraySchema.parse([{ tag: "foo", count: 2 }]),
		).not.toThrow();
		expect(() =>
			countByTagsArraySchema.parse([{ tag: 123, count: "bad" }]),
		).toThrow();
	});

	it("should export schema types that match interface types", () => {
		const testData = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};

		// This should compile without errors, proving type compatibility
		const parsedSubscriber: SubscriberSchemaType =
			subscriberSchema.parse(testData);
		const typedSubscriber: Subscriber = parsedSubscriber;

		expect(parsedSubscriber.id).toBe(typedSubscriber.id);
		expect(parsedSubscriber.email).toBe(typedSubscriber.email);
	});

	it("should export count response schema types", () => {
		const statusData = { count: 10, status: "ENABLED" };
		const tagsData = { count: 5, tag: "premium" };

		const parsedStatus: CountByStatusResponseSchemaType =
			countByStatusResponseSchema.parse(statusData);
		const parsedTags: CountByTagsResponseSchemaType =
			countByTagsResponseSchema.parse(tagsData);

		const typedStatus: CountByStatusResponse = parsedStatus;
		const typedTags: CountByTagsResponse = parsedTags;

		expect(parsedStatus.count).toBe(typedStatus.count);
		expect(parsedTags.tag).toBe(typedTags.tag);
	});
});
