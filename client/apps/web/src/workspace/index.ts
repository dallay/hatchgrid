/**
 * @fileoverview Workspace Module - Clean Architecture Implementation
 *
 * This module provides comprehensive workspace management functionality following
 * clean architecture principles. It includes domain models, use cases, infrastructure
 * adapters, state management, and presentation components.
 *
 * ## Architecture Layers:
 * - **Domain**: Core business logic, entities, and interfaces
 * - **Infrastructure**: External API integrations and adapters
 * - **Store**: State management with Pinia
 * - **Providers**: Dependency injection and store factories
 * - **Composables**: Reusable composition functions
 *
 * ## Quick Start:
 * ```typescript
 * import { useWorkspaceStoreProvider } from "@/workspace";
 *
 * const workspaceStore = useWorkspaceStoreProvider();
 * await workspaceStore.loadAll();
 * await workspaceStore.selectWorkspace("workspace-id");
 * ```
 *
 * @see {@link docs/src/content/docs/core-concepts/workspace.md} For comprehensive documentation
 * @version 1.0.0
 * @author Hatchgrid Development Team
 */

// Domain layer exports

// Composables exports
export {
	useWorkspaceInitialization,
	type WorkspaceInitializationOptions,
	type WorkspaceInitializationState,
} from "./composables/index.ts";
export type { Workspace, WorkspaceRepository } from "./domain/index.ts";
export { GetWorkspaceById, ListWorkspaces } from "./domain/index.ts";
// Infrastructure layer exports
export {
	createWorkspaceStorage,
	STORAGE_KEY_SELECTED_WORKSPACE,
	type WorkspaceStorage,
	workspaceStorage,
} from "./infrastructure/index.ts";
// Provider layer exports
export {
	createWorkspaceStoreFactory,
	initializeWorkspaceStore,
	resetWorkspaceStore,
	useWorkspaceStoreProvider,
} from "./providers/index.ts";
// Store layer exports
export type {
	LoadingStates,
	WorkspaceError,
	WorkspaceStore,
	WorkspaceStoreDependencies,
	WorkspaceStoreState,
	WorkspaceUseCases,
} from "./store/index.ts";
export {
	createWorkspaceStore,
	createWorkspaceStoreWithDependencies,
	useWorkspaceStore,
} from "./store/index.ts";
