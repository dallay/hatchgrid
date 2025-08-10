/**
 * Validation utilities for Workspace domain objects.
 * Provides runtime validation and type checking for workspace data.
 */

import { z } from "zod";
import type { Workspace } from "./Workspace";

/**
 * Zod schema for Workspace validation.
 * Uses Zod's native validators for better performance and maintainability.
 */
export const WorkspaceSchema = z.object({
	id: z.uuid("Workspace id must be a valid UUID"),
	name: z
		.string()
		.min(1, "Workspace name must not be empty")
		.max(100, "Workspace name must be 100 characters or less")
		.transform((s) => s.trim()),
	description: z
		.string()
		.max(500, "Workspace description must be 500 characters or less")
		.optional(),
	ownerId: z.uuid("Workspace ownerId must be a valid UUID"),
	isDefault: z.boolean("Workspace isDefault must be a boolean"),
	createdAt: z.iso.datetime(
		"Workspace createdAt must be a valid ISO 8601 date",
	),
	updatedAt: z.iso.datetime(
		"Workspace updatedAt must be a valid ISO 8601 date",
	),
});

/**
 * Inferred TypeScript type from the Zod schema.
 * This ensures the schema and type stay synchronized.
 */
export type WorkspaceSchemaType = z.infer<typeof WorkspaceSchema>;

/**
 * Validates if a string is a valid UUID using Zod's native UUID validation.
 * More reliable and consistent with the schema validation.
 */
export function isValidUUID(value: string): boolean {
	return z.uuid().safeParse(value).success;
}

/**
 * Validates if a string is a valid ISO 8601 date using Zod's native datetime validation.
 */
export function isValidISODate(value: string): boolean {
	return z.iso.datetime().safeParse(value).success;
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
	IS_DEFAULT_BOOLEAN_REQUIRED: "Workspace isDefault must be a boolean",
	CREATED_AT_STRING_REQUIRED: "Workspace createdAt must be a string",
	CREATED_AT_VALID_DATE_REQUIRED:
		"Workspace createdAt must be a valid ISO 8601 date",
	UPDATED_AT_STRING_REQUIRED: "Workspace updatedAt must be a string",
	UPDATED_AT_VALID_DATE_REQUIRED:
		"Workspace updatedAt must be a valid ISO 8601 date",
} as const;

/**
 * Validates workspace name constraints using Zod.
 */
export function isValidWorkspaceName(name: string): boolean {
	const nameSchema = z
		.string()
		.min(1)
		.max(VALIDATION_CONSTRAINTS.WORKSPACE_NAME_MAX_LENGTH);
	return nameSchema.safeParse(name.trim()).success;
}

/**
 * Validates workspace description constraints using Zod.
 */
export function isValidWorkspaceDescription(description?: string): boolean {
	if (description === undefined) return true;
	const descriptionSchema = z
		.string()
		.max(VALIDATION_CONSTRAINTS.WORKSPACE_DESCRIPTION_MAX_LENGTH);
	return descriptionSchema.safeParse(description).success;
}

/**
 * Comprehensive workspace validation using Zod schema.
 * Provides detailed error messages and type safety.
 * Maps Zod error messages to match the original validation error format.
 */
export function validateWorkspace(data: unknown): {
	isValid: boolean;
	errors: string[];
} {
	const result = WorkspaceSchema.safeParse(data);

	if (result.success) {
		return { isValid: true, errors: [] };
	}

	const errors = result.error.issues.map((issue) => {
		// Map Zod errors to original error message format for backward compatibility
		const field = issue.path[0] as string;
		const message = issue.message;

		// Handle type errors - when field is not a string
		if (issue.code === "invalid_type" && issue.expected === "string") {
			switch (field) {
				case "id":
					return VALIDATION_MESSAGES.ID_STRING_REQUIRED;
				case "name":
					return VALIDATION_MESSAGES.NAME_STRING_REQUIRED;
				case "description":
					return VALIDATION_MESSAGES.DESCRIPTION_STRING_REQUIRED;
				case "ownerId":
					return VALIDATION_MESSAGES.OWNER_ID_STRING_REQUIRED;
				case "createdAt":
					return VALIDATION_MESSAGES.CREATED_AT_STRING_REQUIRED;
				case "updatedAt":
					return VALIDATION_MESSAGES.UPDATED_AT_STRING_REQUIRED;
			}
		}

		// Handle type errors - when field is not a boolean
		if (issue.code === "invalid_type" && issue.expected === "boolean") {
			if (field === "isDefault") {
				return VALIDATION_MESSAGES.IS_DEFAULT_BOOLEAN_REQUIRED;
			}
		}

		// Handle object-level errors (non-object data)
		if (issue.code === "invalid_type" && issue.expected === "object") {
			return VALIDATION_MESSAGES.OBJECT_REQUIRED;
		}

		// Handle UUID validation errors
		if (message.includes("uuid") || message.includes("UUID")) {
			if (field === "id") return VALIDATION_MESSAGES.ID_VALID_UUID_REQUIRED;
			if (field === "ownerId")
				return VALIDATION_MESSAGES.OWNER_ID_VALID_UUID_REQUIRED;
		}

		// Handle string length validation errors
		if (issue.code === "too_small" || issue.code === "too_big") {
			if (field === "name") return VALIDATION_MESSAGES.NAME_LENGTH_INVALID;
			if (field === "description")
				return VALIDATION_MESSAGES.DESCRIPTION_LENGTH_INVALID;
		}

		// Handle datetime validation errors
		if (message.includes("datetime") || message.includes("ISO 8601")) {
			if (field === "createdAt")
				return VALIDATION_MESSAGES.CREATED_AT_VALID_DATE_REQUIRED;
			if (field === "updatedAt")
				return VALIDATION_MESSAGES.UPDATED_AT_VALID_DATE_REQUIRED;
		}

		// Fallback to original Zod message format
		return field ? `${field}: ${message}` : message;
	});

	return { isValid: false, errors };
}

/**
 * Creates a validated Workspace instance using Zod schema.
 * Throws a detailed error if validation fails, otherwise returns the parsed and transformed data.
 *
 * @param data - The data to validate and transform
 * @returns A validated Workspace instance
 * @throws Error if validation fails with detailed error messages
 */
export function createValidatedWorkspace(data: unknown): Workspace {
	const validation = validateWorkspace(data);

	if (!validation.isValid) {
		throw new Error(`Invalid workspace data: ${validation.errors.join(", ")}`);
	}

	// If validation passes, we can safely parse and transform the data
	return WorkspaceSchema.parse(data);
}

/**
 * Parses and validates workspace data using Zod schema.
 * Returns the parsed data with transformations applied (e.g., trimmed name).
 * Throws ZodError if validation fails.
 */
export function parseWorkspace(data: unknown): WorkspaceSchemaType {
	return WorkspaceSchema.parse(data);
}

/**
 * Safe parsing of workspace data using Zod schema.
 * Returns a result object indicating success or failure with detailed errors.
 *
 * @param data - The data to validate
 * @returns SafeParseResult with success/error information
 */
export function safeParseWorkspace(data: unknown) {
	return WorkspaceSchema.safeParse(data);
}

/**
 * Validates if a workspace can be set as default.
 * Business rule: Only one workspace per user can be default.
 *
 * @param workspace - The workspace to validate
 * @param existingWorkspaces - Array of existing workspaces for the same owner
 * @returns True if the workspace can be set as default
 */
export function canSetAsDefault(
	workspace: Workspace,
	existingWorkspaces: Workspace[] = [],
): boolean {
	if (!workspace.isDefault) {
		return true; // Not setting as default, always valid
	}

	// Check if there's already a default workspace for this owner
	const hasExistingDefault = existingWorkspaces.some(
		(w) =>
			w.ownerId === workspace.ownerId && w.isDefault && w.id !== workspace.id,
	);

	return !hasExistingDefault;
}
