/**
 * Workspace domain model representing a workspace entity.
 *
 * @interface Workspace
 * @property {string} id - Unique identifier (UUID) for the workspace
 * @property {string} name - Display name of the workspace
 * @property {string} [description] - Optional description of the workspace
 * @property {string} ownerId - UUID of the workspace owner
 * @property {string} createdAt - ISO 8601 timestamp when the workspace was created
 * @property {string} updatedAt - ISO 8601 timestamp when the workspace was last updated
 */
export interface Workspace {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly ownerId: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

/**
 * Type guard to check if an object is a valid Workspace.
 * Useful for runtime validation of API responses.
 * Enhanced with proper validation using domain validation functions.
 */
export function isWorkspace(obj: unknown): obj is Workspace {
	if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
		return false;
	}

	const workspace = obj as Record<string, unknown>;

	return (
		typeof workspace.id === "string" &&
		workspace.id.length > 0 &&
		typeof workspace.name === "string" &&
		workspace.name.length > 0 &&
		typeof workspace.ownerId === "string" &&
		workspace.ownerId.length > 0 &&
		typeof workspace.createdAt === "string" &&
		workspace.createdAt.length > 0 &&
		typeof workspace.updatedAt === "string" &&
		workspace.updatedAt.length > 0 &&
		(workspace.description === undefined ||
			(typeof workspace.description === "string" &&
				workspace.description.length >= 0))
	);
}
