import { describe, expect, it } from "vitest";
import { tagSchema } from "./schema";
import { TagColors } from "./Tag";

describe("tagSchema", () => {
	it("should validate a valid tag object", () => {
		const validTag = {
			id: "tag-123",
			name: "Technology",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		const result = tagSchema.parse(validTag);
		expect(result).toEqual(validTag);
	});

	it("should use default color when color is not provided", () => {
		const tagWithoutColor = {
			id: "tag-123",
			name: "Technology",
			subscribers: "user1,user2",
		};

		const result = tagSchema.parse(tagWithoutColor);
		expect(result.color).toBe(TagColors.Default);
	});

	it("should fail validation when id is empty string", () => {
		const invalidTag = {
			id: "",
			name: "Technology",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when id is missing", () => {
		const invalidTag = {
			name: "Technology",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when name is too short", () => {
		const invalidTag = {
			id: "tag-123",
			name: "T",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when name is too long", () => {
		const invalidTag = {
			id: "tag-123",
			name: "This is a very long tag name that exceeds the maximum allowed length of fifty characters",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when name is missing", () => {
		const invalidTag = {
			id: "tag-123",
			color: TagColors.Blue,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when color is invalid", () => {
		const invalidTag = {
			id: "tag-123",
			name: "Technology",
			color: "InvalidColor" as any,
			subscribers: "user1,user2",
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should fail validation when subscribers is missing", () => {
		const invalidTag = {
			id: "tag-123",
			name: "Technology",
			color: TagColors.Blue,
		};

		expect(() => tagSchema.parse(invalidTag)).toThrow();
	});

	it("should validate with minimum valid name length", () => {
		const validTag = {
			id: "tag-123",
			name: "Te",
			color: TagColors.Red,
			subscribers: "",
		};

		const result = tagSchema.parse(validTag);
		expect(result.name).toBe("Te");
	});

	it("should validate with maximum valid name length", () => {
		const validTag = {
			id: "tag-123",
			name: "This is exactly fifty characters for tag name.",
			color: TagColors.Red,
			subscribers: "users",
		};

		const result = tagSchema.parse(validTag);
		expect(result.name).toBe("This is exactly fifty characters for tag name.");
	});
});
