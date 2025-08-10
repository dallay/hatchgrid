/**
 * Workspace domain models and utilities.
 * Provides clean exports for all workspace-related domain types and functions.
 */

export type { Workspace } from "./Workspace";
export { isWorkspace } from "./Workspace";
export {
	canSetAsDefault,
	createValidatedWorkspace,
	isValidISODate,
	isValidUUID,
	isValidWorkspaceDescription,
	isValidWorkspaceName,
	validateWorkspace,
} from "./WorkspaceValidation";
