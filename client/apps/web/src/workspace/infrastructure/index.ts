/**
 * Infrastructure layer exports for workspace module
 */

// API
export { WorkspaceApi } from "./api/WorkspaceApi";

// HTTP Client
export {
	AxiosHttpClient,
	type HttpRequestConfig,
	type IHttpClient,
} from "./http/HttpClient";
// Providers (Dependency Injection)
export {
	createWorkspaceStoreFactory,
	initializeWorkspaceStore,
	resetWorkspaceStore,
	useWorkspaceStoreProvider,
} from "./providers";
// Storage
export {
	createWorkspaceStorage,
	STORAGE_KEY_SELECTED_WORKSPACE,
	type WorkspaceStorage,
	workspaceStorage,
} from "./storage";

// Store
export type {
	LoadingStates,
	WorkspaceError,
	WorkspaceStore,
	WorkspaceStoreDependencies,
	WorkspaceStoreState,
	WorkspaceUseCases,
} from "./store";
export {
	createWorkspaceStore,
	createWorkspaceStoreWithDependencies,
	useWorkspaceStore,
} from "./store";
// Validation
export {
	validateCollectionResponse,
	validateSingleItemResponse,
	validateWorkspaceData,
} from "./validation/ResponseValidator";
