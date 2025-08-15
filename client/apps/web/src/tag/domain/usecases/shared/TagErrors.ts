/**
 * Domain-specific error types for tag operations
 * Provides structured error handling with specific error codes
 */

/**
 * Base class for all tag-related errors
 */
export abstract class TagError extends Error {
	abstract readonly code: string;
	public details?: Record<string, unknown>;

	constructor(message: string, details?: Record<string, unknown>) {
		super(message);
		this.name = this.constructor.name;
		this.details = details;
	}
}

/**
 * Error thrown when a tag is not found
 */
export class TagNotFoundError extends TagError {
	readonly code = "TAG_NOT_FOUND";

	constructor(id: string) {
		super(`Tag with ID ${id} not found`);
	}
}

/**
 * Error thrown when tag validation fails
 */
export class TagValidationError extends TagError {
	readonly code = "TAG_VALIDATION_ERROR";

	constructor(message: string, field?: string) {
		super(message);
		if (field) {
			this.details = { field };
		}
	}
}

/**
 * Error thrown when tag deletion is not allowed
 */
export class TagDeletionNotAllowedError extends TagError {
	readonly code = "TAG_DELETION_NOT_ALLOWED";

	constructor(reason: string, tagId: string) {
		super(`Cannot delete tag: ${reason}`);
		this.details = { tagId, reason };
	}
}
