/**
 * Application layer exports for workspace module
 * Contains application services and composables that orchestrate domain logic
 */

// Composables (application-level logic)
export {
	useWorkspaceInitialization,
	type WorkspaceInitializationOptions,
	type WorkspaceInitializationState,
} from "./composables";
// Application Services (orchestrate domain use cases)
export { WorkspaceApplicationService } from "./services";
