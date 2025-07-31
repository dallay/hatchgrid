/**
 * Validation utilities for Workspace domain objects.
 * Provides runtime validation and type checking for workspace data.
 */

import type { Workspace } from "./Workspace";

// Consider migrating to Zod schema for better type safety and maintainability:
// import { z } from 'zod';
//
// export const WorkspaceSchema = z.object({
//   id: z.string().uuid(),
//   name: z.string().min(1).max(100).transform(s => s.trim()),
//   description: z.string().max(500).optional(),
//   ownerId: z.string().uuid(),
//   createdAt: z.string().datetime(),
//   updatedAt: z.string().datetime(),
// });

/**
 * UUID validation regex pattern.
 * Optimized for performance with early length check.
 */
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ISO 8601 date validation regex pattern.
 */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

/**
 * Validates if a string is a valid UUID.
 * Includes early length check for performance optimization.
 */
export function isValidUUID(value: string): boolean {
	// Early return for obvious invalid cases (performance optimization)
	if (!value || value.length !== 36) {
		return false;
	}

	return UUID_REGEX.test(value);
}

/**
 * Validates if a string is a valid ISO 8601 date.
 * Optimized with early checks and simplified logic.
 */
export function isValidISODate(value: string): boolean {
	// Early return for obvious invalid cases
	if (!value || value.length < 19) {
		return false;
	}

	if (!ISO_DATE_REGEX.test(value)) {
		return false;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return false;
	}

	// For dates without Z, just check if they parse correctly
	if (!value.endsWith("Z")) {
		return true;
	}

	// For dates with Z, ensure they match the ISO string
	const isoString = date.toISOString();
	return isoString === value || isoString.startsWith(value.substring(0, 19));
}

/**
 * Validation constants for better maintainability.
 */
export const VALIDATION_CONSTRAINTS = {
	WORKSPACE_NAME_MAX_LENGTH: 100,
	WORKSPACE_DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Validation error messages for consistency.
 */
export const VALIDATION_MESSAGES = {
	OBJECT_REQUIRED: "Workspace data must be an object",
	ID_STRING_REQUIRED: "Workspace id must be a string",
	ID_VALID_UUID_REQUIRED: "Workspace id must be a valid UUID",
	NAME_STRING_REQUIRED: "Workspace name must be a string",
	NAME_LENGTH_INVALID: `Workspace name must be between 1 and ${VALIDATION_CONSTRAINTS.WORKSPACE_NAME_MAX_LENGTH} characters`,
	DESCRIPTION_STRING_REQUIRED: "Workspace description must be a string",
	DESCRIPTION_LENGTH_INVALID: `Workspace description must be ${VALIDATION_CONSTRAINTS.WORKSPACE_DESCRIPTION_MAX_LENGTH} characters or less`,
	OWNER_ID_STRING_REQUIRED: "Workspace ownerId must be a string",
	OWNER_ID_VALID_UUID_REQUIRED: "Workspace ownerId must be a valid UUID",
	CREATED_AT_STRING_REQUIRED: "Workspace createdAt must be a string",
	CREATED_AT_VALID_DATE_REQUIRED:
		"Workspace createdAt must be a valid ISO 8601 date",
	UPDATED_AT_STRING_REQUIRED: "Workspace updatedAt must be a string",
	UPDATED_AT_VALID_DATE_REQUIRED:
		"Workspace updatedAt must be a valid ISO 8601 date",
} as const;

/**
 * Validates workspace name constraints.
 */
export function isValidWorkspaceName(name: string): boolean {
	return (
		name.trim().length > 0 &&
		name.length <= VALIDATION_CONSTRAINTS.WORKSPACE_NAME_MAX_LENGTH
	);
}

/**
 * Validates workspace description constraints.
 */
export function isValidWorkspaceDescription(description?: string): boolean {
	if (description === undefined) return true;
	return (
		description.length <=
		VALIDATION_CONSTRAINTS.WORKSPACE_DESCRIPTION_MAX_LENGTH
	);
}

/**
 * Comprehensive workspace validation with detailed error messages.
 * Uses constants for consistent error messaging.
 */
export function validateWorkspace(data: unknown): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return { isValid: false, errors: [VALIDATION_MESSAGES.OBJECT_REQUIRED] };
	}

	const workspace = data as Record<string, unknown>;

	// Validate id
	if (typeof workspace.id !== "string") {
		errors.push(VALIDATION_MESSAGES.ID_STRING_REQUIRED);
	} else if (!isValidUUID(workspace.id)) {
		errors.push(VALIDATION_MESSAGES.ID_VALID_UUID_REQUIRED);
	}

	// Validate name
	if (typeof workspace.name !== "string") {
		errors.push(VALIDATION_MESSAGES.NAME_STRING_REQUIRED);
	} else if (!isValidWorkspaceName(workspace.name)) {
		errors.push(VALIDATION_MESSAGES.NAME_LENGTH_INVALID);
	}

	// Validate description (optional)
	if (workspace.description !== undefined) {
		if (typeof workspace.description !== "string") {
			errors.push(VALIDATION_MESSAGES.DESCRIPTION_STRING_REQUIRED);
		} else if (!isValidWorkspaceDescription(workspace.description)) {
			errors.push(VALIDATION_MESSAGES.DESCRIPTION_LENGTH_INVALID);
		}
	}

	// Validate ownerId
	if (typeof workspace.ownerId !== "string") {
		errors.push(VALIDATION_MESSAGES.OWNER_ID_STRING_REQUIRED);
	} else if (!isValidUUID(workspace.ownerId)) {
		errors.push(VALIDATION_MESSAGES.OWNER_ID_VALID_UUID_REQUIRED);
	}

	// Validate createdAt
	if (typeof workspace.createdAt !== "string") {
		errors.push(VALIDATION_MESSAGES.CREATED_AT_STRING_REQUIRED);
	} else if (!isValidISODate(workspace.createdAt)) {
		errors.push(VALIDATION_MESSAGES.CREATED_AT_VALID_DATE_REQUIRED);
	}

	// Validate updatedAt
	if (typeof workspace.updatedAt !== "string") {
		errors.push(VALIDATION_MESSAGES.UPDATED_AT_STRING_REQUIRED);
	} else if (!isValidISODate(workspace.updatedAt)) {
		errors.push(VALIDATION_MESSAGES.UPDATED_AT_VALID_DATE_REQUIRED);
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Creates a validated Workspace instance.
 * Throws a detailed error if validation fails.
 */
export function createValidatedWorkspace(data: unknown): Workspace {
	const validation = validateWorkspace(data);

	if (!validation.isValid) {
		throw new Error(`Invalid workspace data: ${validation.errors.join(", ")}`);
	}

	return data as Workspace;
}
