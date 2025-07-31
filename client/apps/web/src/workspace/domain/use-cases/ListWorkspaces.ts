import { WorkspaceApiError } from "../errors/WorkspaceErrors.ts";
import type { Workspace } from "../models/Workspace.ts";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository.ts";

/**
 * Use case for listing all workspaces accessible to the current user.
 *
 * This use case encapsulates the business logic for retrieving all workspaces
 * that the current user has access to. It follows the clean architecture
 * principle by depending on abstractions (repository interface) rather than
 * concrete implementations.
 *
 * @class ListWorkspaces
 */
export class ListWorkspaces {
	/**
	 * Creates an instance of ListWorkspaces use case.
	 *
	 * @param {WorkspaceRepository} workspaceRepository - The repository for workspace data access
	 */
	constructor(private readonly workspaceRepository: WorkspaceRepository) {}

	/**
	 * Executes the use case to retrieve all accessible workspaces.
	 *
	 * @returns {Promise<Workspace[]>} Promise resolving to an array of workspaces
	 * @throws {WorkspaceApiError} When the repository operation fails
	 */
	async execute(): Promise<Workspace[]> {
		try {
			const response = await this.workspaceRepository.list();
			return response.data;
		} catch (error) {
			// Re-throw all workspace domain errors as-is
			if (error instanceof WorkspaceApiError) {
				throw error;
			}

			// Wrap unknown errors in domain error with more context
			throw new WorkspaceApiError("list workspaces", undefined, error);
		}
	}
}
