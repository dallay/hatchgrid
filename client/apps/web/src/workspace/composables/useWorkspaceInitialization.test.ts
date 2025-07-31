import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import {
	useWorkspaceInitialization,
} from "./useWorkspaceInitialization";

interface MockWorkspaceStore {
  loadAll: () => Promise<void>;
  restorePersistedWorkspace: () => Promise<boolean>;
  selectWorkspace: (id: string) => Promise<void>;
  workspaces: Array<{ id: string }>;
  hasError: boolean;
  error: Error | null;
  isWorkspaceSelected: boolean;
  // Agrega aquí cualquier otra propiedad necesaria
}

function createMockStore(overrides: Partial<MockWorkspaceStore> = {}): MockWorkspaceStore {
  return {
	loadAll: vi.fn().mockResolvedValue(undefined),
	restorePersistedWorkspace: vi.fn().mockResolvedValue(false),
	selectWorkspace: vi.fn().mockResolvedValue(undefined),
	workspaces: [],
	hasError: false,
	error: null,
	isWorkspaceSelected: false,
	...overrides,
  };
}

describe("useWorkspaceInitialization", () => {
	let store: ReturnType<typeof createMockStore>;

	beforeEach(() => {
		store = createMockStore();
	});

	it("should auto-initialize on mount if autoLoad or autoRestore is true", async () => {
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(store, { autoLoad: true, onInitialized });
		await initialize();
		expect(store.loadAll).toHaveBeenCalled();
	});

	it("should not auto-initialize on mount if both autoLoad and autoRestore are false", async () => {
		const onInitialized = vi.fn();
		useWorkspaceInitialization(store, {
			autoLoad: false,
			autoRestore: false,
			onInitialized,
		});
		await nextTick();
		expect(store.loadAll).not.toHaveBeenCalled();
	});

	it("should call onInitialized with true if workspace is restored", async () => {
		store.restorePersistedWorkspace = vi.fn().mockResolvedValue(true);
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(store, { onInitialized });
		await initialize();
		expect(onInitialized).toHaveBeenCalledWith(true);
	});

	it("should select first workspace if none is restored and selectFirstIfNone is true", async () => {
		store.restorePersistedWorkspace = vi.fn().mockResolvedValue(false);
		store.workspaces = [{ id: "w1" }];
		store.selectWorkspace = vi.fn().mockResolvedValue(undefined);
		store.isWorkspaceSelected = true;
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(store, { onInitialized });
		await initialize();
		expect(store.selectWorkspace).toHaveBeenCalledWith("w1");
		expect(onInitialized).toHaveBeenCalledWith(true);
	});

	it("should not select first workspace if selectFirstIfNone is false", async () => {
		store.restorePersistedWorkspace = vi.fn().mockResolvedValue(false);
		store.workspaces = [{ id: "w1" }];
		store.selectWorkspace = vi.fn().mockResolvedValue(undefined);
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(store, {
			selectFirstIfNone: false,
			onInitialized,
		});
		await initialize();
		expect(store.selectWorkspace).not.toHaveBeenCalled();
		expect(onInitialized).toHaveBeenCalledWith(false);
	});

	it("should set initializationError if loadAll fails", async () => {
		store.loadAll = vi.fn().mockResolvedValue(undefined);
		store.hasError = true;
		store.error = new Error("Load failed");
		const onError = vi.fn();
		const { initialize, initializationError } = useWorkspaceInitialization(
			store,
			{ onError },
		);
		await initialize();
		expect(initializationError.value).toBeInstanceOf(Error);
		expect(initializationError.value?.message).toBe("Load failed");
		expect(onError).toHaveBeenCalledWith(expect.any(Error));
	});

	it("should reset initialization state", async () => {
		store.loadAll = vi.fn().mockResolvedValue(undefined);
		const {
			initialize,
			resetInitialization,
			isInitializing,
			isInitialized,
			initializationError,
		} = useWorkspaceInitialization(store);
		await initialize();
		resetInitialization();
		expect(isInitializing.value).toBe(false);
		expect(isInitialized.value).toBe(false);
		expect(initializationError.value).toBeNull();
	});

	it("should not re-initialize if already initializing or initialized", async () => {
		const { initialize, isInitializing, isInitialized } =
			useWorkspaceInitialization(store);
		isInitializing.value = true;
		await initialize();
		expect(store.loadAll).not.toHaveBeenCalledTimes(2);

		isInitializing.value = false;
		isInitialized.value = true;
		await initialize();
		expect(store.loadAll).not.toHaveBeenCalledTimes(2);
	});
});
