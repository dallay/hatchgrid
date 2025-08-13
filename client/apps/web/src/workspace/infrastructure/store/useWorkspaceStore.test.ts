import { createPinia, setActivePinia } from "pinia";
import type {
	GetWorkspaceById,
	ListWorkspaces,
} from "src/workspace/domain/usecases";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockedFunction,
	vi,
} from "vitest";
import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import type { Workspace, WorkspaceStorage } from "@/workspace";
import {
	createWorkspaceStore,
	type WorkspaceStoreDependencies,
	type WorkspaceUseCases,
} from "@/workspace";

// Test constants for better maintainability
const TEST_WORKSPACE_IDS = {
	WORKSPACE_1: "123e4567-e89b-12d3-a456-426614174000",
	WORKSPACE_2: "123e4567-e89b-12d3-a456-426614174002",
	WORKSPACE_3: "123e4567-e89b-12d3-a456-426614174003",
} as const;

const TEST_OWNER_IDS = {
	OWNER_1: "123e4567-e89b-12d3-a456-426614174001",
	OWNER_2: "123e4567-e89b-12d3-a456-426614174003",
} as const;

// Test data factory for better maintainability
const createMockWorkspace = (
	overrides: Partial<Workspace> = {},
): Workspace => ({
	id: TEST_WORKSPACE_IDS.WORKSPACE_1,
	name: "Test Workspace",
	description: "Test workspace description",
	ownerId: TEST_OWNER_IDS.OWNER_1,
	isDefault: false,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	...overrides,
});

// Mock data
const mockWorkspaces: Workspace[] = [
	createMockWorkspace({
		id: TEST_WORKSPACE_IDS.WORKSPACE_1,
		name: "Test Workspace 1",
		description: "First test workspace",
	}),
	createMockWorkspace({
		id: TEST_WORKSPACE_IDS.WORKSPACE_2,
		name: "Test Workspace 2",
		ownerId: TEST_OWNER_IDS.OWNER_2,
		description: undefined, // Test optional field
	}),
];

const mockWorkspace = mockWorkspaces[0];

// Mock use cases with proper typing
const createMockUseCases = (): WorkspaceUseCases => ({
	listWorkspaces: {
		execute: vi.fn(),
	} as unknown as ListWorkspaces,
	getWorkspaceById: {
		execute: vi.fn(),
	} as unknown as GetWorkspaceById,
});

// Mock storage
const createMockStorage = (): WorkspaceStorage => ({
	getSelectedWorkspaceId: vi.fn().mockReturnValue(null),
	setSelectedWorkspaceId: vi.fn(),
	clearSelectedWorkspaceId: vi.fn(),
	hasPersistedWorkspace: vi.fn().mockReturnValue(false),
	trySetSelectedWorkspaceId: vi.fn(),
});

// Helper functions for cleaner test code
const getMockListWorkspaces = (mockUseCases: WorkspaceUseCases) =>
	mockUseCases.listWorkspaces.execute as MockedFunction<
		() => Promise<CollectionResponse<Workspace>>
	>;

const getMockGetWorkspaceById = (mockUseCases: WorkspaceUseCases) =>
	mockUseCases.getWorkspaceById.execute as MockedFunction<
		(id: string) => Promise<SingleItemResponse<Workspace> | null>
	>;

describe("Workspace Store", () => {
	let mockUseCases: WorkspaceUseCases;
	let mockStorage: WorkspaceStorage;
	let store: ReturnType<ReturnType<typeof createWorkspaceStore>>;

	beforeEach(() => {
		setActivePinia(createPinia());
		mockUseCases = createMockUseCases();
		mockStorage = createMockStorage();

		const dependencies: WorkspaceStoreDependencies = {
			useCases: mockUseCases,
			storage: mockStorage,
		};

		const storeFactory = createWorkspaceStore(dependencies);
		store = storeFactory();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Caching", () => {
		describe("Workspace List Caching", () => {
			it("should cache workspace list after successful load", async () => {
				const mockExecute = getMockListWorkspaces(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspaces });

				await store.loadAll();
				expect(mockExecute).toHaveBeenCalledTimes(1);

				await store.loadAll();
				expect(mockExecute).toHaveBeenCalledTimes(1);
				expect(store.workspaces).toEqual(mockWorkspaces);
			});

			it("should bypass cache when forceRefresh is true", async () => {
				const mockExecute = getMockListWorkspaces(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspaces });

				await store.loadAll();
				expect(mockExecute).toHaveBeenCalledTimes(1);

				await store.loadAll(true);
				expect(mockExecute).toHaveBeenCalledTimes(2);
			});

			it("should invalidate workspace list cache", async () => {
				const mockExecute = getMockListWorkspaces(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspaces });

				await store.loadAll();
				expect(mockExecute).toHaveBeenCalledTimes(1);

				store.invalidateCache({ workspaceList: true });

				await store.loadAll();
				expect(mockExecute).toHaveBeenCalledTimes(2);
			});
		});

		describe("Workspace Details Caching", () => {
			it("should cache workspace details after successful selection", async () => {
				const mockExecute = getMockGetWorkspaceById(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspace });

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockExecute).toHaveBeenCalledTimes(1);

				store.clearCurrentWorkspaceForTesting();

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockExecute).toHaveBeenCalledTimes(1);
				expect(store.currentWorkspace).toEqual(mockWorkspace);
			});

			it("should invalidate specific workspace details cache", async () => {
				const mockExecute = getMockGetWorkspaceById(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspace });

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockExecute).toHaveBeenCalledTimes(1);

				store.invalidateCache({ workspaceDetails: [mockWorkspace.id] });

				store.clearCurrentWorkspaceForTesting();

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockExecute).toHaveBeenCalledTimes(2);
			});

			it("should invalidate multiple workspace details caches", async () => {
				const mockExecute = getMockGetWorkspaceById(mockUseCases);
				mockExecute.mockImplementation((id: string) => {
					const workspace = mockWorkspaces.find((w) => w.id === id);
					return Promise.resolve(workspace ? { data: workspace } : null);
				});

				await store.selectWorkspace(mockWorkspaces[0].id);
				await store.selectWorkspace(mockWorkspaces[1].id);
				expect(mockExecute).toHaveBeenCalledTimes(2);

				store.invalidateCache({
					workspaceDetails: [mockWorkspaces[0].id, mockWorkspaces[1].id],
				});

				store.clearCurrentWorkspaceForTesting();

				await store.selectWorkspace(mockWorkspaces[0].id);
				await store.selectWorkspace(mockWorkspaces[1].id);
				expect(mockExecute).toHaveBeenCalledTimes(4);
			});
		});

		describe("Cache Management", () => {
			it("should invalidate all caches", async () => {
				const mockSelectExecute = getMockGetWorkspaceById(mockUseCases);
				mockSelectExecute.mockResolvedValue({ data: mockWorkspace });

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockSelectExecute).toHaveBeenCalledTimes(1);
				expect(store.getCacheStats().workspaceDetails.size).toBe(1);

				store.invalidateCache({ all: true });
				expect(store.getCacheStats().workspaceDetails.size).toBe(0);

				await store.selectWorkspace(mockWorkspace.id);
				expect(mockSelectExecute).toHaveBeenCalledTimes(2);
			});

			it("should clean up expired cache entries", async () => {
				vi.useFakeTimers();

				// Use the existing store and mock
				const mockExecute = getMockListWorkspaces(mockUseCases);
				mockExecute.mockResolvedValue({ data: mockWorkspaces });

				// Load workspaces to populate cache
				await store.loadAll(true); // Force refresh to ensure cache is populated

				// Verify cache is populated
				let stats = store.getCacheStats();
				expect(stats.workspaceList.size).toBe(1);

				// Advance time beyond default TTL (5 minutes = 300000ms)
				vi.advanceTimersByTime(400000);

				// Trigger cleanup
				store.cleanupExpiredCache();

				// Verify expired entries are cleaned up
				stats = store.getCacheStats();
				expect(stats.workspaceList.size).toBe(0);

				vi.useRealTimers();
			});

			it("should cache workspace details correctly", async () => {
				// Use the existing store and mock
				const mockSelectExecute = getMockGetWorkspaceById(mockUseCases);

				const extraWorkspaces: Workspace[] = [
					...mockWorkspaces,
					createMockWorkspace({
						id: TEST_WORKSPACE_IDS.WORKSPACE_3,
						name: "Test Workspace 3",
						ownerId: TEST_OWNER_IDS.OWNER_2,
					}),
				];

				mockSelectExecute.mockImplementation((id: string) => {
					const ws = extraWorkspaces.find((w) => w.id === id);
					return Promise.resolve(ws ? { data: ws } : null);
				});

				// Clear cache first
				store.invalidateCache({ all: true });
				expect(store.getCacheStats().workspaceDetails.size).toBe(0);

				// Select first workspace
				await store.selectWorkspace(extraWorkspaces[0].id);
				expect(store.getCacheStats().workspaceDetails.size).toBe(1);

				// Select second workspace
				await store.selectWorkspace(extraWorkspaces[1].id);
				expect(store.getCacheStats().workspaceDetails.size).toBe(2);

				// Select third workspace
				await store.selectWorkspace(extraWorkspaces[2].id);
				expect(store.getCacheStats().workspaceDetails.size).toBe(3);
			});
		});
	});
});
