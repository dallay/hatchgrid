/**
 * Infrastructure layer exports for workspace module
 */

export { WorkspaceApi } from "./api/WorkspaceApi";
export {
	AxiosHttpClient,
	type HttpRequestConfig,
	type IHttpClient,
} from "./http/HttpClient";
export {
	createWorkspaceStorage,
	STORAGE_KEY_SELECTED_WORKSPACE,
	type WorkspaceStorage,
	workspaceStorage,
} from "./storage";
export {
	validateCollectionResponse,
	validateSingleItemResponse,
	validateWorkspaceData,
} from "./validation/ResponseValidator";
