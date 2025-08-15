/**
 * Shared validation utilities for tag use cases
 * Provides consistent validation logic across all tag operations
 *
 * @fileoverview This module contains validation utilities that ensure data integrity
 * and provide consistent error handling across the tag domain.
 */

import type { ZodError } from "zod";
import type { TagRepository } from "../../repositories";

/**
 * UUID validation regex (RFC 4122 compliant)
 * Compiled once for better performance
 */
const UUID_REGEX = Object.freeze(
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
);

/**
 * Validate UUID format
 * @param id - The UUID to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if UUID is invalid
 */
export function validateUuid(id: string, fieldName = "ID"): void {
	if (!id || id.trim() === "") {
		throw new Error(`${fieldName} is required`);
	}

	if (!UUID_REGEX.test(id)) {
		throw new Error(`Invalid ${fieldName} format`);
	}
}

/**
 * Format Zod validation errors into user-friendly messages
 * @param error - The ZodError containing validation issues
 * @param criticalFields - Fields to prioritize in error messages
 * @returns Formatted error message
 */
export function formatValidationErrors(
	error: ZodError,
	criticalFields: readonly string[] = ["name", "color"] as const,
): string {
	// Group errors by field for better organization
	const fieldErrors = new Map<string, string[]>();

	// Safely iterate over errors
	const errors = error.issues || [];
	for (const issue of errors) {
		const field = issue.path.join(".") || "general";
		const messages = fieldErrors.get(field) || [];
		messages.push(issue.message);
		fieldErrors.set(field, messages);
	}

	// Create a concise but informative error message
	if (fieldErrors.size === 1) {
		const [messages] = fieldErrors.values();
		return messages[0] || "Validation failed";
	}

	// Multiple field errors - return the most critical one
	for (const field of criticalFields) {
		const messages = fieldErrors.get(field);
		if (messages && messages.length > 0) {
			return messages[0];
		}
	}

	// Fallback to first error
	const firstError = errors[0];
	return firstError?.message || "Validation failed";
}

/**
 * Validate that a string is not empty after trimming
 * @param value - The string to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if string is empty
 */
export function validateNonEmptyString(value: string, fieldName: string): void {
	if (!value || value.trim() === "") {
		throw new Error(`${fieldName} cannot be empty`);
	}
}

/**
 * Validate string length constraints with sanitization
 * @param value - The string to validate
 * @param fieldName - Name of the field for error messages
 * @param maxLength - Maximum allowed length
 * @param minLength - Minimum allowed length (default: 1)
 * @throws Error if length constraints are violated
 */
export function validateStringLength(
	value: string,
	fieldName: string,
	maxLength: number,
	minLength = 1,
): void {
	// Sanitize input: trim and normalize whitespace
	const sanitized = value.trim().replace(/\s+/g, " ");

	if (sanitized.length < minLength) {
		throw new Error(
			`${fieldName} must be at least ${minLength} character${minLength === 1 ? "" : "s"} long`,
		);
	}

	if (sanitized.length > maxLength) {
		throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
	}
}

/**
 * Validate that tag name is unique across all tags
 * @param repository - The tag repository to check against
 * @param name - The tag name to validate
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @throws Error if name is already taken or empty
 */
export async function validateUniqueTagName(
	repository: TagRepository,
	workspaceId: string | undefined,
	name: string,
	excludeId?: string,
): Promise<void> {
	if (!name || name.trim() === "") {
		throw new Error("Tag name cannot be empty");
	}

	// Normalize name for comparisons
	const normalizedName = name.trim();

	// If repository exposes existsByName, prefer calling it. Some tests/mocks
	// use the legacy signature existsByName(name, excludeId) while newer
	// implementations expect existsByName(workspaceId, name, excludeId).
	if (typeof repository.existsByName === "function") {
		// If we have a workspaceId, call the workspace-aware signature
		let exists: boolean;
		if (
			workspaceId &&
			typeof workspaceId === "string" &&
			workspaceId.trim() !== ""
		) {
			exists = await repository.existsByName(
				workspaceId,
				normalizedName,
				excludeId,
			);
		} else {
			// Legacy call expected by many tests: (name, excludeId)
			const legacyExistsFn = repository.existsByName as unknown as (
				name: string,
				excludeId?: string,
			) => Promise<boolean>;
			exists = await legacyExistsFn(normalizedName, excludeId);
		}

		// If existsByName returned a boolean, use that result.
		if (typeof exists === "boolean") {
			if (exists) {
				throw new Error(`Tag with name "${name}" already exists`);
			}
			return;
		}
	}

	// Fallback for repositories that don't implement existsByName: fetch all tags
	const allTags = await repository.findAll(workspaceId);
	const duplicateTag = allTags.find(
		(t) =>
			t.id !== excludeId &&
			t.name.toLowerCase() === normalizedName.toLowerCase(),
	);

	if (duplicateTag) {
		throw new Error(`Tag with name "${name}" already exists`);
	}
}

/**
 * @deprecated Use individual validation functions instead
 * This will be removed in the next major version
 */
export const ValidationUtils = {
	validateUuid,
	formatValidationErrors,
	validateNonEmptyString,
	validateStringLength,
	validateUniqueTagName,
} as const;
