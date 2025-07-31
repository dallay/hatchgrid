/**
 * Use case for listing all accessible workspaces.
 * Implements the business logic for retrieving workspace collections.
 */

import type { CollectionResponse } from "@/shared/response";
import type { Workspace } from "../models/Workspace";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository";

/**
 * Use case for listing workspaces accessible to the current user.
 * Encapsulates the business logic and coordinates with the repository layer.
 */
export class ListWorkspaces {
	constructor(private readonly repository: WorkspaceRepository) {}

	/**
	 * Executes the list workspaces use case.
	 * @returns Promise resolving to a collection of workspaces
	 * @throws {Error} When the repository operation fails
	 */
	async execute(): Promise<CollectionResponse<Workspace>> {
		try {
			return await this.repository.list();
		} catch (error) {
			// Re-throw with additional context if needed
			throw new Error(
				`Failed to list workspaces: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
