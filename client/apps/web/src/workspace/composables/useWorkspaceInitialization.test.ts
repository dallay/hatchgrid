import { createPinia, defineStore, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useWorkspaceInitialization } from "./useWorkspaceInitialization";

describe("useWorkspaceInitialization", () => {
	let store: ReturnType<ReturnType<typeof getTestStore>>;

	function getTestStore() {
		return defineStore("workspace", {
			state: () => ({
				workspaces: [] as Array<{ id: string }>,
				hasError: false,
				error: null as Error | null,
				isWorkspaceSelected: false,
			}),
			actions: {
				async loadAll() {},
				async restorePersistedWorkspace() {
					return false;
				},
				async selectWorkspace(_id: string) {},
			},
		});
	}

	beforeEach(() => {
		setActivePinia(createPinia());
		store = getTestStore()();
		// Mock actions for spying
		store.loadAll = vi.fn().mockResolvedValue(undefined);
		store.restorePersistedWorkspace = vi.fn().mockResolvedValue(false);
		store.selectWorkspace = vi.fn().mockResolvedValue(undefined);
	});

	it("should auto-initialize on mount if autoLoad or autoRestore is true", async () => {
		const onInitialized = vi.fn();
		const { initialize } = useWorkspaceInitialization(store, {
			autoLoad: true,
			onInitialized,
		});
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
		// No need to assign to isInitializing.value/isInitialized.value directly, as they are refs returned by the composable
		isInitializing.value = true;
		await initialize();
		expect(store.loadAll).not.toHaveBeenCalledTimes(2);

		isInitializing.value = false;
		isInitialized.value = true;
		await initialize();
		expect(store.loadAll).not.toHaveBeenCalledTimes(2);
	});
});
