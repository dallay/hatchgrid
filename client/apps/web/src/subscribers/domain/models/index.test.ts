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
	// Types
	type Subscriber,
	type SubscriberSchemaType,
	SubscriberStatus,
	// Schemas
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
			status: "ENABLED",
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
