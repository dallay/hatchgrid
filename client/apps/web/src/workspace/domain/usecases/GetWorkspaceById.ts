/**
 * Use case for retrieving a specific workspace by ID.
 * Implements the business logic for workspace detail retrieval.
 */

import type { SingleItemResponse } from "@/shared/response";
import type { Workspace } from "../models/Workspace";
import { isValidUUID } from "../models/WorkspaceValidation";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository";

/**
 * Use case for retrieving workspace details by ID.
 * Includes validation and error handling for workspace retrieval operations.
 */
export class GetWorkspaceById {
	constructor(private readonly repository: WorkspaceRepository) {}

	/**
	 * Executes the get workspace by ID use case.
	 * @param id - The workspace UUID to retrieve
	 * @returns Promise resolving to workspace data or null if not found
	 * @throws {Error} When the ID is invalid or repository operation fails
	 */
	async execute(id: string): Promise<SingleItemResponse<Workspace> | null> {
		// Validate UUID format before making repository call
		if (!isValidUUID(id)) {
			throw new Error(`Invalid workspace ID format: ${id}`);
		}

		try {
			return await this.repository.getById(id);
		} catch (error) {
			// Re-throw with additional context
			throw new Error(
				`Failed to get workspace ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
