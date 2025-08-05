/**
 * Workspace Application Service
 * Orchestrates domain use cases and provides application-level operations
 */

import type { Workspace } from "../../domain/models";
import type { WorkspaceRepository } from "../../domain/repositories";
import { GetWorkspaceById, ListWorkspaces } from "../../domain/usecases";

export class WorkspaceApplicationService {
	constructor(private readonly workspaceRepository: WorkspaceRepository) {}

	/**
	 * Retrieves a workspace by its ID
	 * @param id - The workspace ID
	 * @returns Promise resolving to the workspace or null if not found
	 */
	async getWorkspaceById(id: string): Promise<Workspace | null> {
		const getWorkspaceUseCase = new GetWorkspaceById(this.workspaceRepository);
		const response = await getWorkspaceUseCase.execute(id);
		return response?.data ?? null;
	}

	/**
	 * Lists all workspaces for the current user
	 * @returns Promise resolving to array of workspaces
	 */
	async listWorkspaces(): Promise<Workspace[]> {
		const listWorkspacesUseCase = new ListWorkspaces(this.workspaceRepository);
		const response = await listWorkspacesUseCase.execute();
		return response.data;
	}

	/**
	 * Validates workspace access for the current user
	 * @param workspaceId - The workspace ID to validate
	 * @returns Promise resolving to boolean indicating access permission
	 */
	async validateWorkspaceAccess(workspaceId: string): Promise<boolean> {
		const workspace = await this.getWorkspaceById(workspaceId);
		return workspace !== null;
	}
}
