import { describe, expect, it } from "vitest";
import { colorClasses, Tag, TagColors } from "./Tag";
import type { TagResponse } from "./TagResponse";

describe("Tag", () => {
	const baseId = "123e4567-e89b-12d3-a456-426614174000";
	const baseName = "Test Tag";

	it("should construct with required fields and defaults", () => {
		const tag = new Tag({ id: baseId, name: baseName });
		expect(tag.id).toBe(baseId);
		expect(tag.name).toBe(baseName);
		expect(tag.color).toBe(TagColors.Default);
		expect(tag.subscribers).toEqual([]);
		expect(tag.createdAt).toBeUndefined();
		expect(tag.updatedAt).toBeUndefined();
	});

	it("should construct with all fields", () => {
		const now = new Date();
		const tag = new Tag({
			id: baseId,
			name: baseName,
			color: TagColors.Purple,
			subscribers: ["a", "b"],
			createdAt: now,
			updatedAt: now,
		});
		expect(tag.color).toBe(TagColors.Purple);
		expect(tag.subscribers).toEqual(["a", "b"]);
		expect(tag.createdAt).toBe(now);
		expect(tag.updatedAt).toBe(now);
	});

  it("should normalize date strings to Date objects", () => {
		const dateStr = "2024-01-01T12:00:00Z";
		const tag = new Tag({
			id: baseId,
			name: baseName,
			createdAt: dateStr,
			updatedAt: dateStr,
		});
		expect(tag.createdAt).toBeInstanceOf(Date);
		expect(tag.updatedAt).toBeInstanceOf(Date);
		expect((tag.createdAt as Date).toISOString()).toBe(dateStr);
		expect((tag.updatedAt as Date).toISOString()).toBe(dateStr);
	});

	it("should create from TagResponse with valid color and array subscribers", () => {
		const response: TagResponse = {
			id: baseId,
			name: baseName,
			color: TagColors.Red,
			subscribers: ["user1", "user2"],
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		};
		const tag = Tag.fromResponse(response);
		expect(tag.id).toBe(response.id);
		expect(tag.name).toBe(response.name);
		expect(tag.color).toBe(TagColors.Red);
		expect(tag.subscribers).toEqual(["user1", "user2"]);
		expect(tag.createdAt).toBeInstanceOf(Date);
		expect(tag.updatedAt).toBeInstanceOf(Date);
	});

	it("should fallback to default color if color is invalid in TagResponse", () => {
		const response: TagResponse = {
			id: baseId,
			name: baseName,
			color: "not-a-color" as TagColors,
			subscribers: [],
			createdAt: undefined,
			updatedAt: undefined,
		};
		const tag = Tag.fromResponse(response);
		expect(tag.color).toBe(TagColors.Default);
	});

	it("should normalize subscribers from comma-separated string", () => {
		const response: TagResponse = {
			id: baseId,
			name: baseName,
			color: TagColors.Blue,
			subscribers: ["alice", "bob", "charlie"],
			createdAt: undefined,
			updatedAt: undefined,
		};
		const tag = Tag.fromResponse(response);
		expect(tag.subscribers).toEqual(["alice", "bob", "charlie"]);
	});

	it("colorClass should return correct CSS class", () => {
		const tag = new Tag({ id: baseId, name: baseName, color: TagColors.Pink });
		expect(tag.colorClass).toBe(colorClasses[TagColors.Pink]);
	});

	it("colorClass should fallback to default CSS class for unknown color", () => {
		// @ts-expect-error: testing fallback
		const tag = new Tag({ id: baseId, name: baseName, color: "unknown" });
		expect(tag.colorClass).toBe(colorClasses[TagColors.Default]);
	});

	it("subscriberCount should return correct number", () => {
		const tag = new Tag({
			id: baseId,
			name: baseName,
			subscribers: ["a", "b", "c"],
		});
		expect(tag.subscriberCount).toBe(3);
	});

	it("subscriberCount should work with empty subscribers", () => {
		const tag = new Tag({ id: baseId, name: baseName });
		expect(tag.subscriberCount).toBe(0);
	});
});
