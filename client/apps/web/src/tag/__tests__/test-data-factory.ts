/**
 * Test data factory for creating consistent test data
 */

import { Tag } from "../domain/models/Tag.ts";
import { TagColors } from "../domain/models/TagColors.ts";

/**
 * Module-level counter for generating unique IDs
 */
let idCounter = 0;

/**
 * Generate a unique test ID
 */
function generateId(): string {
	idCounter++;
	return crypto.randomUUID();
}

/**
 * Create a test tag with default values
 */
export function createTag(
	overrides: Partial<{
		id: string;
		name: string;
		color: TagColors;
		subscribers: ReadonlyArray<string> | string;
		createdAt: Date | string;
		updatedAt: Date | string;
	}> = {},
): Tag {
	const id = overrides.id ?? generateId();
	return new Tag(
		id,
		overrides.name ?? `Test Tag ${idCounter}`,
		overrides.color ?? TagColors.Red,
		overrides.subscribers ?? [],
		overrides.createdAt ?? "2024-01-01T00:00:00Z",
		overrides.updatedAt ?? "2024-01-01T00:00:00Z",
	);
}

/**
 * Create multiple test tags
 */
export function createTags(
	count: number,
	baseOverrides: Partial<Parameters<typeof createTag>[0]> = {},
): Tag[] {
	return Array.from({ length: count }, (_, index) =>
		createTag({
			...baseOverrides,
			name: `${baseOverrides.name ?? "Test Tag"} ${index + 1}`,
			id: generateId(),
		}),
	);
}

/**
 * Create a tag with subscribers
 */
export function createTagWithSubscribers(
	subscriberCount: number,
	overrides: Partial<Parameters<typeof createTag>[0]> = {},
): Tag {
	const subscribers = Array.from(
		{ length: subscriberCount },
		(_, i) => `subscriber-${i + 1}`,
	);
	return createTag({
		...overrides,
		subscribers,
	});
}

/**
 * Create premium tag preset
 */
export function createPremiumTag(
	overrides: Partial<Parameters<typeof createTag>[0]> = {},
): Tag {
	return createTag({
		name: "Premium",
		color: TagColors.Red,
		subscribers: ["sub1", "sub2"],
		...overrides,
	});
}

/**
 * Create basic tag preset
 */
export function createBasicTag(
	overrides: Partial<Parameters<typeof createTag>[0]> = {},
): Tag {
	return createTag({
		name: "Basic",
		color: TagColors.Blue,
		subscribers: [],
		...overrides,
	});
}

/**
 * Reset the ID counter for consistent test results
 */
export function resetCounter(): void {
	idCounter = 0;
}
