/**
 * Composable for workspace initialization logic
 * Handles automatic workspace loading and default selection on application startup
 */

import { onMounted, readonly, ref } from "vue";
import type { WorkspaceStore } from "../store/useWorkspaceStore";

/**
 * Initialization options
 */
export interface WorkspaceInitializationOptions {
	/**
	 * Whether to automatically load workspaces on mount
	 * @default true
	 */
	autoLoad?: boolean;

	/**
	 * Whether to automatically restore persisted workspace selection
	 * @default true
	 */
	autoRestore?: boolean;

	/**
	 * Whether to select the first available workspace if none is persisted
	 * @default true
	 */
	selectFirstIfNone?: boolean;

	/**
	 * Callback called when initialization is complete
	 */
	onInitialized?: (hasSelectedWorkspace: boolean) => void;

	/**
	 * Callback called when initialization fails
	 */
	onError?: (error: Error) => void;
}

/**
 * Initialization state
 */
export interface WorkspaceInitializationState {
	readonly isInitializing: boolean;
	readonly isInitialized: boolean;
	readonly initializationError: Error | null;
}

/**
 * Composable for workspace initialization
 * @param store - The workspace store instance
 * @param options - Initialization options
 * @returns Initialization state and methods
 */
export const useWorkspaceInitialization = (
	store: WorkspaceStore,
	options: WorkspaceInitializationOptions = {}
) => {
	const {
		autoLoad = true,
		autoRestore = true,
		selectFirstIfNone = true,
		onInitialized,
		onError,
	} = options;

	// State
	const isInitializing = ref(false);
	const isInitialized = ref(false);
	const initializationError = ref<Error | null>(null);

	/**
	 * Helper function to load workspaces with error handling
	 */
	const loadWorkspaces = async (): Promise<void> => {
		await store.loadAll();

		// Check if loading failed
		if (store.hasError) {
			throw new Error(store.error?.message || "Failed to load workspaces");
		}
	};

	/**
	 * Helper function to restore persisted workspace selection
	 */
	const restoreWorkspaceSelection = async (): Promise<boolean> => {
		return await store.restorePersistedWorkspace();
	};

	/**
	 * Helper function to select the first available workspace
	 */
	const selectFirstAvailableWorkspace = async (): Promise<boolean> => {
		if (store.workspaces.length === 0) {
			return false;
		}

		const firstWorkspace = store.workspaces[0];
		await store.selectWorkspace(firstWorkspace.id);
		return store.isWorkspaceSelected;
	};

	/**
	 * Initializes workspace state
	 */
	const initialize = async (): Promise<void> => {
		if (isInitializing.value || isInitialized.value) {
			return;
		}

		isInitializing.value = true;
		initializationError.value = null;

		try {
			let hasSelectedWorkspace = false;

			// Step 1: Load all workspaces if requested
			if (autoLoad) {
				await loadWorkspaces();
			}

			// Step 2: Try to restore persisted workspace selection
			if (autoRestore) {
				hasSelectedWorkspace = await restoreWorkspaceSelection();
			}

			// Step 3: Select first workspace if none is selected and we have workspaces
			if (!hasSelectedWorkspace && selectFirstIfNone) {
				hasSelectedWorkspace = await selectFirstAvailableWorkspace();
			}

			isInitialized.value = true;
			onInitialized?.(hasSelectedWorkspace);

		} catch (error) {
			const initError = error instanceof Error ? error : new Error("Unknown initialization error");
			initializationError.value = initError;
			onError?.(initError);
		} finally {
			isInitializing.value = false;
		}
	};

	/**
	 * Resets initialization state
	 */
	const resetInitialization = (): void => {
		isInitializing.value = false;
		isInitialized.value = false;
		initializationError.value = null;
	};

	/**
	 * Auto-initialize on mount if requested
	 */
	if (autoLoad || autoRestore) {
		onMounted(() => {
			initialize();
		});
	}

	return {
		// State
		isInitializing: readonly(isInitializing),
		isInitialized: readonly(isInitialized),
		initializationError: readonly(initializationError),

		// Methods
		initialize,
		resetInitialization,
	};
};
