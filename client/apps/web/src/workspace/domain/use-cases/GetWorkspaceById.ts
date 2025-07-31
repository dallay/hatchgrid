import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
} from "../errors/WorkspaceErrors.ts";
import type { Workspace } from "../models/Workspace.ts";
import { isValidUUID } from "../models/WorkspaceValidation.ts";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository.ts";

/**
 * Use case for retrieving a workspace by its unique identifier.
 *
 * This use case encapsulates the business logic for fetching a specific workspace
 * by ID, including validation and error handling. It follows clean architecture
 * principles by depending on abstractions rather than concrete implementations.
 *
 * @class GetWorkspaceById
 */
export class GetWorkspaceById {
	/**
	 * Creates an instance of GetWorkspaceById use case.
	 *
	 * @param {WorkspaceRepository} workspaceRepository - The repository for workspace data access
	 */
	constructor(private readonly workspaceRepository: WorkspaceRepository) {}

	/**
	 * Executes the use case to retrieve a workspace by its ID.
	 *
	 * @param {string} id - The UUID of the workspace to retrieve
	 * @returns {Promise<Workspace | null>} Promise resolving to workspace data or null if not found
	 * @throws {InvalidWorkspaceIdError} When the ID format is invalid
	 * @throws {WorkspaceApiError} When the repository operation fails
	 */
	async execute(id: string): Promise<Workspace | null> {
		// Validate that the ID is a valid UUID format
		if (!isValidUUID(id)) {
			throw new InvalidWorkspaceIdError(id);
		}

		try {
			const response = await this.workspaceRepository.getById(id);
			return response?.data ?? null;
		} catch (error) {
			// Re-throw domain errors as-is
			if (
				error instanceof InvalidWorkspaceIdError ||
				error instanceof WorkspaceApiError
			) {
				throw error;
			}

			// Wrap unknown errors in domain error
			throw new WorkspaceApiError(`get workspace ${id}`, undefined, error);
		}
	}
}
