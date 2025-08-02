/**
 * Factory for creating workspace store with proper dependency injection
 * This ensures type safety and proper initialization order
 */

import type { WorkspaceRepository } from "../domain/repositories";
import { GetWorkspaceById, ListWorkspaces } from "../domain/use-cases";
import { type WorkspaceStorage, workspaceStorage } from "../infrastructure";
import {
	createWorkspaceStore,
	type WorkspaceStoreDependencies,
	type WorkspaceUseCases,
} from "./useWorkspaceStore";

/**
 * Creates a workspace store with all required dependencies
 * @param repository - The workspace repository implementation
 * @param storage - Optional workspace storage implementation (defaults to workspaceStorage)
 * @returns Configured workspace store
 */
export const createWorkspaceStoreWithDependencies = (
	repository: WorkspaceRepository,
	storage: WorkspaceStorage = workspaceStorage,
) => {
	// Create use cases with repository dependency
	const useCases: WorkspaceUseCases = {
		listWorkspaces: new ListWorkspaces(repository),
		getWorkspaceById: new GetWorkspaceById(repository),
	};

	// Create dependencies object
	const dependencies: WorkspaceStoreDependencies = {
		useCases,
		storage,
	};

	// Create and return the store with injected dependencies
	return createWorkspaceStore(dependencies);
};

/**
 * Type for the factory function return
 */
export type WorkspaceStoreFactory = typeof createWorkspaceStoreWithDependencies;
