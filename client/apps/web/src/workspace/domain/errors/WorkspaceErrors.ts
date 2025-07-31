/**
 * Domain-specific error types for workspace operations.
 * These errors provide better context and type safety for error handling.
 */

/**
 * Base class for all workspace-related errors
 */
export abstract class WorkspaceError extends Error {
	abstract readonly code: string;

	constructor(message: string, public readonly cause?: unknown) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Thrown when a workspace is not found
 */
export class WorkspaceNotFoundError extends WorkspaceError {
	readonly code = 'WORKSPACE_NOT_FOUND';

	constructor(workspaceId: string, cause?: unknown) {
		super(`Workspace with ID ${workspaceId} not found`, cause);
	}
}

/**
 * Thrown when workspace ID format is invalid
 */
export class InvalidWorkspaceIdError extends WorkspaceError {
	readonly code = 'INVALID_WORKSPACE_ID';

	constructor(workspaceId: string, cause?: unknown) {
		super(`Invalid workspace ID format: ${workspaceId}`, cause);
	}
}

/**
 * Thrown when API response format is invalid
 */
export class InvalidResponseFormatError extends WorkspaceError {
	readonly code = 'INVALID_RESPONSE_FORMAT';

	constructor(expectedFormat: string, cause?: unknown) {
		super(`Invalid response format: expected ${expectedFormat}`, cause);
	}
}

/**
 * Thrown when workspace API operations fail
 */
export class WorkspaceApiError extends WorkspaceError {
	readonly code = 'WORKSPACE_API_ERROR';

	constructor(
		operation: string,
		public readonly statusCode?: number,
		cause?: unknown
	) {
		super(`Workspace API error during ${operation}`, cause);
	}
}
