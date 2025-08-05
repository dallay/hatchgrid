/**
 * Workspace store module exports
 * Provides clean imports for workspace state management
 */

export {
	createWorkspaceStore,
	type LoadingStates,
	useWorkspaceStore,
	type WorkspaceError,
	type WorkspaceStore,
	type WorkspaceStoreDependencies,
	type WorkspaceStoreState,
	type WorkspaceUseCases,
} from "./useWorkspaceStore";

export {
	createWorkspaceStoreWithDependencies,
	type WorkspaceStoreFactory,
} from "./WorkspaceStoreFactory";
