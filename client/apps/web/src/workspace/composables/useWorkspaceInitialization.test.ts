import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import type { Workspace } from "../domain/models";
import type {
	WorkspaceError,
	WorkspaceStore,
} from "../store/useWorkspaceStore";
import { useWorkspaceInitialization } from "./useWorkspaceInitialization";

describe("useWorkspaceInitialization", () => {
	let mockStore: WorkspaceStore;

	// Helper to create a mock workspace
	const createMockWorkspace = (id: string): Workspace => ({
		id,
		name: `Workspace ${id}`,
		description: `Description for workspace ${id}`,
		ownerId: "owner-id",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
	});

	beforeEach(() => {
		setActivePinia(createPinia());

		// Create a type-safe mock store
		mockStore = {
			// State
			workspaces: [],
			currentWorkspace: null,
			loading: {
				loadingAll: false,
				loadingById: false,
			},
			error: null,

			// Computed
			isLoading: false,
			hasError: false,
			workspaceCount: 0,
			isWorkspaceSelected: false,
			workspaceById: () => () => undefined,

			// Actions - will be mocked
			resetState: vi.fn(),
			clearError: vi.fn(),
			loadAll: vi.fn().mockResolvedValue(undefined),
			selectWorkspace: vi.fn().mockResolvedValue(undefined),
			restorePersistedWorkspace: vi.fn().mockResolvedValue(false),
			clearWorkspaceSelection: vi.fn(),
			getPersistedWorkspaceId: vi.fn().mockReturnValue(null),
			hasPersistedWorkspace: vi.fn().mockReturnValue(false),

			// Cache management
			invalidateCache: vi.fn(),
			getCacheStats: vi.fn().mockReturnValue({}),
			cleanupExpiredCache: vi.fn(),

			// Test helpers
			clearCurrentWorkspaceForTesting: vi.fn(),
		} as unknown as WorkspaceStore;
	});

	it("should auto-initialize on mount if autoLoad or autoRestore is true", async () => {
		const onInitialized = vi.fn();

		// Create a test component that uses the composable to test auto-initialization
		const TestComponent = defineComponent({
			setup() {
				const initialization = useWorkspaceInitialization(mockStore, {
					autoLoad: true,
					onInitialized,
				});
				return { initialization };
			},
			template: "<div>Test</div>",
		});

		// Mount the component to trigger onMounted and auto-initialization
		mount(TestComponent);

		// Wait for the next tick to allow onMounted to execute
		await nextTick();

		expect(mockStore.loadAll).toHaveBeenCalled();
	});

	it("should not auto-initialize on mount if both autoLoad and autoRestore are false", async () => {
		const onInitialized = vi.fn();

		// Create a test component that uses the composable
		const TestComponent = defineComponent({
			setup() {
				const initialization = useWorkspaceInitialization(mockStore, {
					autoLoad: false,
					autoRestore: false,
					onInitialized,
				});
				return { initialization };
			},
			template: "<div>Test</div>",
		});

		// Mount the component
		mount(TestComponent);

		// Wait for the next tick
		await nextTick();

		expect(mockStore.loadAll).not.toHaveBeenCalled();
	});

	it("should allow manual initialization when initialize() is called explicitly", async () => {
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(mockStore, {
			autoLoad: false, // Disable auto-initialization to test manual call
			autoRestore: false,
			onInitialized,
		});

		// Manually call initialize
		await initialize();

		// Since autoLoad is false, loadAll should not be called
		// but the initialization process should still complete
		expect(mockStore.loadAll).not.toHaveBeenCalled();
		expect(onInitialized).toHaveBeenCalledWith(false);
	});

	it("should call onInitialized with true if workspace is restored", async () => {
		mockStore.restorePersistedWorkspace = vi.fn().mockResolvedValue(true);
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(mockStore, {
			onInitialized,
		});
		await initialize();
		expect(onInitialized).toHaveBeenCalledWith(true);
	});

	it("should select first workspace if none is restored and selectFirstIfNone is true", async () => {
		mockStore.restorePersistedWorkspace = vi.fn().mockResolvedValue(false);
		// Mock the workspaces array to have a workspace
		Object.defineProperty(mockStore, "workspaces", {
			value: [createMockWorkspace("w1")],
			writable: true,
		});
		// Mock isWorkspaceSelected to return true after selection
		Object.defineProperty(mockStore, "isWorkspaceSelected", {
			value: true,
			writable: true,
		});

		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(mockStore, {
			onInitialized,
		});
		await initialize();
		expect(mockStore.selectWorkspace).toHaveBeenCalledWith("w1");
		expect(onInitialized).toHaveBeenCalledWith(true);
	});

	it("should not select first workspace if selectFirstIfNone is false", async () => {
		mockStore.restorePersistedWorkspace = vi.fn().mockResolvedValue(false);
		Object.defineProperty(mockStore, "workspaces", {
			value: [createMockWorkspace("w1")],
			writable: true,
		});

		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(mockStore, {
			selectFirstIfNone: false,
			onInitialized,
		});
		await initialize();
		expect(mockStore.selectWorkspace).not.toHaveBeenCalled();
		expect(onInitialized).toHaveBeenCalledWith(false);
	});

	it("should set initializationError if loadAll fails", async () => {
		mockStore.loadAll = vi.fn().mockResolvedValue(undefined);
		// Mock the store to have an error state
		Object.defineProperty(mockStore, "hasError", {
			value: true,
			writable: true,
		});
		Object.defineProperty(mockStore, "error", {
			value: {
				message: "Load failed",
				timestamp: new Date(),
			} as WorkspaceError,
			writable: true,
		});

		const onError = vi.fn();
		const { initialize, initializationError } = useWorkspaceInitialization(
			mockStore,
			{ onError },
		);
		await initialize();
		expect(initializationError.value).toBeInstanceOf(Error);
		expect(initializationError.value?.message).toBe("Load failed");
		expect(onError).toHaveBeenCalledWith(expect.any(Error));
	});

	it("should reset initialization state", async () => {
		mockStore.loadAll = vi.fn().mockResolvedValue(undefined);
		const {
			initialize,
			resetInitialization,
			isInitializing,
			isInitialized,
			initializationError,
		} = useWorkspaceInitialization(mockStore);
		await initialize();
		resetInitialization();
		expect(isInitializing.value).toBe(false);
		expect(isInitialized.value).toBe(false);
		expect(initializationError.value).toBeNull();
	});

	it("should not re-initialize if already initializing or initialized", async () => {
		const { initialize } = useWorkspaceInitialization(mockStore);
		// Test that multiple calls don't trigger multiple loads
		await initialize();
		expect(mockStore.loadAll).toHaveBeenCalledTimes(1);

		await initialize();
		expect(mockStore.loadAll).toHaveBeenCalledTimes(1); // Should still be 1, not 2
	});
});
