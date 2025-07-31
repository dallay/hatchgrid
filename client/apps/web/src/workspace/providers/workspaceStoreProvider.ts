/**
 * Workspace store provider for dependency injection
 * Creates and configures the workspace store with proper dependencies
 */

import { AxiosHttpClient, WorkspaceApi } from "../infrastructure";
import { createWorkspaceStoreWithDependencies } from "../store/WorkspaceStoreFactory";

/**
 * Configuration for HTTP client
 */
interface HttpClientConfig {
	timeout: number;
	maxRetries: number;
	retryDelay: number;
}

/**
 * Default HTTP client configuration
 */
const DEFAULT_HTTP_CONFIG: HttpClientConfig = {
	timeout: 10000,
	maxRetries: 3,
	retryDelay: 1000,
} as const;

/**
 * Creates a workspace store factory with configurable dependencies
 * @param httpConfig - Optional HTTP client configuration
 * @returns Function that creates a workspace store instance
 */
export const createWorkspaceStoreFactory = (
	httpConfig: HttpClientConfig = DEFAULT_HTTP_CONFIG,
) => {
	return () => {
		try {
			// Create HTTP client with provided configuration
			const httpClient = new AxiosHttpClient(httpConfig);

			// Create workspace API repository
			const workspaceRepository = new WorkspaceApi(httpClient);

			// Create and return the store with dependencies
			return createWorkspaceStoreWithDependencies(workspaceRepository);
		} catch (error) {
			console.error("Failed to create workspace store:", error);
			throw new Error("Workspace store initialization failed");
		}
	};
};

/**
 * Default workspace store factory instance
 */
const defaultWorkspaceStoreFactory = createWorkspaceStoreFactory();

/**
 * Main workspace store instance
 * Initialized lazily on first access
 */
let workspaceStoreInstance: ReturnType<typeof defaultWorkspaceStoreFactory> | null = null;

/**
 * Gets the workspace store instance using lazy initialization
 * @returns The workspace store instance
 */
export const useWorkspaceStoreProvider = () => {
	if (!workspaceStoreInstance) {
		workspaceStoreInstance = defaultWorkspaceStoreFactory();
	}
	return workspaceStoreInstance;
};

/**
 * Initializes the workspace store during app startup
 * This is optional - the store will be created lazily if not explicitly initialized
 * @param httpConfig - Optional HTTP client configuration
 * @returns The initialized workspace store
 */
export const initializeWorkspaceStore = (
	httpConfig?: HttpClientConfig,
) => {
	const factory = httpConfig
		? createWorkspaceStoreFactory(httpConfig)
		: defaultWorkspaceStoreFactory;

	workspaceStoreInstance = factory();
	return workspaceStoreInstance;
};

/**
 * Resets the workspace store instance (useful for testing)
 * @internal
 */
export const resetWorkspaceStore = () => {
	workspaceStoreInstance = null;
};
