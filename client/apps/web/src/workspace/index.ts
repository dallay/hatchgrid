/**
 * Workspace module public API
 * Provides clean interface for using the workspace feature
 */

// Application layer exports (composables and services)
export {
	useWorkspaceInitialization,
	WorkspaceApplicationService,
	type WorkspaceInitializationOptions,
	type WorkspaceInitializationState,
} from "./application";
// Domain layer exports (models, use cases, repositories)
export type { Workspace, WorkspaceRepository } from "./domain";
export { GetWorkspaceById, ListWorkspaces } from "./domain";

// Infrastructure layer exports (store, API, storage, providers)
export {
	createWorkspaceStorage,
	createWorkspaceStore,
	createWorkspaceStoreFactory,
	createWorkspaceStoreWithDependencies,
	initializeWorkspaceStore,
	type LoadingStates,
	resetWorkspaceStore,
	STORAGE_KEY_SELECTED_WORKSPACE,
	useWorkspaceStore,
	useWorkspaceStoreProvider,
	type WorkspaceError,
	type WorkspaceStorage,
	type WorkspaceStore,
	type WorkspaceStoreDependencies,
	type WorkspaceStoreState,
	type WorkspaceUseCases,
	workspaceStorage,
} from "./infrastructure";
