/**
 * Repository interface for workspace data access.
 * Defines the contract for workspace data operations following the repository pattern.
 */

import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import type { Workspace } from "../models/Workspace";

/**
 * Repository interface for workspace operations.
 * Implementations should handle data access, caching, and error handling.
 */
export interface WorkspaceRepository {
	/**
	 * Retrieves all workspaces accessible to the current user.
	 * @returns Promise resolving to a collection of workspaces
	 * @throws {Error} When the operation fails
	 */
	list(): Promise<CollectionResponse<Workspace>>;

	/**
	 * Retrieves a specific workspace by its ID.
	 * @param id - The workspace UUID
	 * @returns Promise resolving to workspace data or null if not found
	 * @throws {Error} When the operation fails (excluding not found)
	 */
	getById(id: string): Promise<SingleItemResponse<Workspace> | null>;
}
