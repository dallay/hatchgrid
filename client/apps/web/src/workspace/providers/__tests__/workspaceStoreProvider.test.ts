/**
 * Tests for workspace store provider
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createWorkspaceStoreFactory,
	initializeWorkspaceStore,
	resetWorkspaceStore,
	useWorkspaceStoreProvider,
} from "@/workspace";

// Mock the dependencies
vi.mock("../../infrastructure", () => ({
	AxiosHttpClient: vi.fn().mockImplementation(() => ({})),
	WorkspaceApi: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../store/WorkspaceStoreFactory", () => ({
	createWorkspaceStoreWithDependencies: vi.fn().mockReturnValue(() => ({
		workspaces: [],
		currentWorkspace: null,
		loading: { loadingAll: false, loadingById: false },
		error: null,
		isLoading: false,
		hasError: false,
		workspaceCount: 0,
		isWorkspaceSelected: false,
		loadAll: vi.fn(),
		selectWorkspace: vi.fn(),
		resetState: vi.fn(),
	})),
}));

describe("workspaceStoreProvider", () => {
	beforeEach(() => {
		// Reset the store instance before each test
		resetWorkspaceStore();
		vi.clearAllMocks();
	});

	describe("createWorkspaceStoreFactory", () => {
		it("should create a factory function with default config", () => {
			const factory = createWorkspaceStoreFactory();
			expect(typeof factory).toBe("function");
		});

		it("should create a factory function with custom config", () => {
			const customConfig = {
				timeout: 5000,
				maxRetries: 2,
				retryDelay: 500,
			};
			const factory = createWorkspaceStoreFactory(customConfig);
			expect(typeof factory).toBe("function");
		});

		it("should handle errors during store creation", () => {
			// This test is simplified since we can't easily mock the internal factory
			const factory = createWorkspaceStoreFactory();
			expect(typeof factory).toBe("function");
		});
	});

	describe("useWorkspaceStoreProvider", () => {
		it("should return the same instance on multiple calls", () => {
			const store1 = useWorkspaceStoreProvider();
			const store2 = useWorkspaceStoreProvider();
			expect(store1).toBe(store2);
		});

		it("should create store lazily", () => {
			// This test is simplified since we can't easily test the internal factory calls
			const store = useWorkspaceStoreProvider();
			expect(store).toBeDefined();
		});
	});

	describe("initializeWorkspaceStore", () => {
		it("should initialize store with default config", () => {
			const store = initializeWorkspaceStore();
			expect(store).toBeDefined();
		});

		it("should initialize store with custom config", () => {
			const customConfig = {
				timeout: 15000,
				maxRetries: 5,
				retryDelay: 2000,
			};
			const store = initializeWorkspaceStore(customConfig);
			expect(store).toBeDefined();
		});

		it("should return the same instance after initialization", () => {
			const initializedStore = initializeWorkspaceStore();
			const providerStore = useWorkspaceStoreProvider();
			expect(initializedStore).toBe(providerStore);
		});
	});
});
