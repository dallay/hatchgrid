/**
 * Tests for Subscriber domain models
 * Validates TypeScript interfaces and enum definitions
 */

import { describe, expect, it } from "vitest";
import type { CountByStatusResponse, CountByTagsResponse } from ".";
import {
	type Attributes,
	type Subscriber,
	SubscriberStatus,
} from "./Subscriber";

describe("SubscriberStatus", () => {
	it("should have correct enum values", () => {
		expect(SubscriberStatus.ENABLED).toBe("ENABLED");
		expect(SubscriberStatus.DISABLED).toBe("DISABLED");
		expect(SubscriberStatus.BLOCKLISTED).toBe("BLOCKLISTED");
	});

	it("should have exactly 3 status values", () => {
		const statusValues = Object.values(SubscriberStatus);
		expect(statusValues).toHaveLength(3);
		expect(statusValues).toEqual(["ENABLED", "DISABLED", "BLOCKLISTED"]);
	});
});

describe("Subscriber interface", () => {
	it("should accept valid subscriber data", () => {
		const subscriber: Subscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			name: "Test User",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: new Date(),
			updatedAt: "2024-01-01T00:00:00Z",
		};

		expect(subscriber.id).toBe("123e4567-e89b-12d3-a456-426614174000");
		expect(subscriber.email).toBe("test@example.com");
		expect(subscriber.status).toBe(SubscriberStatus.ENABLED);
	});

	it("should accept subscriber with attributes", () => {
		const attributes: Attributes = {
			firstName: "John",
			lastName: "Doe",
			age: 30,
			isActive: true,
			tags: ["premium", "newsletter"],
		};

		const subscriber: Subscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "john@example.com",
			status: SubscriberStatus.ENABLED,
			attributes,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};

		expect(subscriber.attributes).toEqual(attributes);
		expect(subscriber.attributes?.firstName).toBe("John");
		expect(subscriber.attributes?.age).toBe(30);
		expect(subscriber.attributes?.isActive).toBe(true);
		expect(subscriber.attributes?.tags).toEqual(["premium", "newsletter"]);
	});

	it("should accept minimal subscriber data", () => {
		const subscriber: Subscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "minimal@example.com",
			status: SubscriberStatus.DISABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		};

		expect(subscriber.name).toBeUndefined();
		expect(subscriber.attributes).toBeUndefined();
		expect(subscriber.createdAt).toBeUndefined();
		expect(subscriber.updatedAt).toBeUndefined();
	});
});

describe("CountByStatusResponse interface", () => {
	it("should accept valid count by status data", () => {
		const response: CountByStatusResponse = {
			count: 42,
			status: "ENABLED",
		};

		expect(response.count).toBe(42);
		expect(response.status).toBe("ENABLED");
	});
});

describe("CountByTagsResponse interface", () => {
	it("should accept valid count by tags data", () => {
		const response: CountByTagsResponse = {
			count: 15,
			tag: "premium",
		};

		expect(response.count).toBe(15);
		expect(response.tag).toBe("premium");
	});
});

describe("Attributes interface", () => {
	it("should accept various data types", () => {
		const attributes: Attributes = {
			stringValue: "test",
			numberValue: 123,
			booleanValue: true,
			arrayValue: ["item1", "item2", "item3"],
		};

		expect(attributes.stringValue).toBe("test");
		expect(attributes.numberValue).toBe(123);
		expect(attributes.booleanValue).toBe(true);
		expect(attributes.arrayValue).toEqual(["item1", "item2", "item3"]);
	});

	it("should accept empty attributes object", () => {
		const attributes: Attributes = {};
		expect(Object.keys(attributes)).toHaveLength(0);
	});

	it("should handle Date objects and string dates correctly", () => {
		const subscriberWithDateObject: Subscriber = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			status: SubscriberStatus.ENABLED,
			workspaceId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: new Date("2024-01-01T00:00:00Z"),
			updatedAt: "2024-01-01T00:00:00Z",
		};

		expect(subscriberWithDateObject.createdAt).toBeInstanceOf(Date);
		expect(typeof subscriberWithDateObject.updatedAt).toBe("string");
	});
});
