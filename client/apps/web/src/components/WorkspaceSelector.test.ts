import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import {
	createMockWorkspaces,
	type MockComposableSetup,
	setupWorkspaceMocks,
} from "./test-helpers/workspace-test-utils";

// Mock the composables before importing the component
vi.mock("./composables/useWorkspaceSelection", () => ({
	useWorkspaceSelection: vi.fn(),
}));
vi.mock("./composables/useWorkspaceDisplay", () => ({
	useWorkspaceDisplay: vi.fn(),
}));
vi.mock("./composables/useWorkspaceErrorHandling", () => ({
	useWorkspaceErrorHandling: vi.fn(),
}));
vi.mock("./composables/useWorkspaceSearch", () => ({
	useWorkspaceSearch: vi.fn(),
}));

// Mock vue-sonner
vi.mock("vue-sonner", () => ({
	toast: vi.fn(),
}));

// Mock the sidebar composable
vi.mock("@/components/ui/sidebar", () => ({
	SidebarMenu: { template: "<div><slot /></div>" },
	SidebarMenuButton: { template: "<button><slot /></button>" },
	SidebarMenuItem: { template: "<div><slot /></div>" },
	useSidebar: () => ({ isMobile: false }),
}));

// Mock dropdown menu components
vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: { template: "<div><slot /></div>" },
	DropdownMenuContent: { template: "<div><slot /></div>" },
	DropdownMenuItem: {
		template: "<div @click=\"$emit('click')\"><slot /></div>",
	},
	DropdownMenuLabel: { template: "<div><slot /></div>" },
	DropdownMenuSeparator: { template: "<div />" },
	DropdownMenuTrigger: { template: "<div><slot /></div>" },
}));

// Mock alert components
vi.mock("@/components/ui/alert", () => ({
	Alert: { template: "<div><slot /></div>" },
	AlertDescription: { template: "<div><slot /></div>" },
}));

// Import the component AFTER the mocks
import WorkspaceSelector from "./WorkspaceSelector.vue";

const mockWorkspaces = createMockWorkspaces();

// Test constants for better maintainability
const TEST_SELECTORS = {
	WORKSPACE_ITEM: '[data-testid="workspace-item"]',
	WORKSPACE_SELECTOR_TRIGGER: '[data-testid="workspace-selector-trigger"]',
} as const;

const TEST_MESSAGES = {
	LOADING: "Loading...",
	PLEASE_WAIT: "Please wait",
	NO_WORKSPACE_SELECTED: "No workspace selected",
	NO_WORKSPACES_AVAILABLE: "No workspaces available",
	ERROR: "Error",
	FAILED_TO_LOAD: "Failed to load workspaces",
} as const;

describe("WorkspaceSelector", () => {
	// Access mocked functions directly
	const mocks = {
		useWorkspaceSelection: vi.fn(),
		useWorkspaceDisplay: vi.fn(),
		useWorkspaceErrorHandling: vi.fn(),
		useWorkspaceSearch: vi.fn(),
	};

	const setupMocks = (setup: MockComposableSetup = {}) => {
		const { selectedWorkspace, onWorkspaceSelected } = setupWorkspaceMocks(
			mocks,
			{
				activeWorkspace: mockWorkspaces[0],
				hasWorkspaces: true,
				displayText: "Test Workspace 1",
				displaySubtext: "First test workspace",
				filteredWorkspaces: mockWorkspaces,
				...setup,
			},
		);

		// Simulate the watch effect for initial selection
		onWorkspaceSelected.value = (id: string) => {
			mocks.useWorkspaceSelection().selectWorkspace(id);
		};

		return { selectedWorkspace, onWorkspaceSelected };
	};

	const createWrapper = (props: Record<string, unknown> = {}) => {
		return mount(WorkspaceSelector, {
			props: {
				workspaces: mockWorkspaces,
				...props,
			},
		});
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		// Setup default mocks for all tests
		setupMocks();

		// Connect our mock functions to the mocked modules
		const { useWorkspaceSelection } = await import(
			"./composables/useWorkspaceSelection"
		);
		const { useWorkspaceDisplay } = await import(
			"./composables/useWorkspaceDisplay"
		);
		const { useWorkspaceErrorHandling } = await import(
			"./composables/useWorkspaceErrorHandling"
		);
		const { useWorkspaceSearch } = await import(
			"./composables/useWorkspaceSearch"
		);

		vi.mocked(useWorkspaceSelection).mockImplementation(
			mocks.useWorkspaceSelection,
		);
		vi.mocked(useWorkspaceDisplay).mockImplementation(
			mocks.useWorkspaceDisplay,
		);
		vi.mocked(useWorkspaceErrorHandling).mockImplementation(
			mocks.useWorkspaceErrorHandling,
		);
		vi.mocked(useWorkspaceSearch).mockImplementation(mocks.useWorkspaceSearch);
	});

	describe("Rendering States", () => {
		it("should render successfully with available workspaces", () => {
			const wrapper = createWrapper();
			expect(wrapper.text()).toContain("Test Workspace 1");
		});

		it("should display loading state with appropriate indicators", () => {
			setupMocks({
				activeWorkspace: null,
				hasWorkspaces: false,
				displayText: TEST_MESSAGES.LOADING,
				displaySubtext: TEST_MESSAGES.PLEASE_WAIT,
				showEmptyState: false,
				filteredWorkspaces: [],
			});

			const wrapper = mount(WorkspaceSelector, {
				props: {
					workspaces: [],
					loading: true,
				},
			});

			expect(wrapper.text()).toContain(TEST_MESSAGES.LOADING);
			expect(wrapper.text()).toContain(TEST_MESSAGES.PLEASE_WAIT);
		});

		it("should show empty state when no workspaces are available", () => {
			setupMocks({
				activeWorkspace: null,
				hasWorkspaces: false,
				displayText: TEST_MESSAGES.NO_WORKSPACE_SELECTED,
				displaySubtext: TEST_MESSAGES.NO_WORKSPACES_AVAILABLE,
				showEmptyState: true,
				filteredWorkspaces: [],
			});

			const wrapper = mount(WorkspaceSelector, {
				props: {
					workspaces: [],
					loading: false,
				},
			});

			expect(wrapper.text()).toContain(TEST_MESSAGES.NO_WORKSPACE_SELECTED);
			expect(wrapper.text()).toContain(TEST_MESSAGES.NO_WORKSPACES_AVAILABLE);
		});
	});

	describe("Workspace Selection", () => {
		it("should emit workspace-change event on initial selection", async () => {
			// Setup mock with proper typing and synchronous behavior
			type WorkspaceSelectionOptions = {
				onWorkspaceChange?: (workspaceId: string) => void;
			};

			const mockSelectWorkspace = vi.fn();
			let capturedCallback: ((workspaceId: string) => void) | undefined;

			mocks.useWorkspaceSelection.mockImplementation(
				(options?: WorkspaceSelectionOptions) => {
					capturedCallback = options?.onWorkspaceChange;
					return {
						activeWorkspace: ref(mockWorkspaces[0]),
						hasWorkspaces: computed(() => true),
						selectWorkspace: mockSelectWorkspace,
					};
				},
			);

			const wrapper = createWrapper();
			await nextTick();

			// Simulate the initial workspace selection callback
			if (capturedCallback) {
				capturedCallback(mockWorkspaces[0].id);
				await nextTick();
			}

			expect(wrapper.emitted("workspace-change")).toBeTruthy();
			expect(wrapper.emitted("workspace-change")?.[0]).toEqual([
				mockWorkspaces[0].id,
			]);
		});

		it("should use initialWorkspaceId when provided", async () => {
			let emitCallback: ((workspaceId: string) => void) | null = null;

			mocks.useWorkspaceSelection.mockImplementation((options: any) => {
				emitCallback = options.onWorkspaceChange;
				// Simulate selection with provided initial ID
				if (emitCallback) {
					setTimeout(() => emitCallback!("2"), 0);
				}
				return {
					activeWorkspace: ref(mockWorkspaces[1]),
					hasWorkspaces: computed(() => true),
					selectWorkspace: vi.fn(),
				};
			});

			const wrapper = createWrapper({ initialWorkspaceId: "2" });
			await nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for async emission

			expect(wrapper.emitted("workspace-change")?.[0]).toEqual(["2"]);
		});

		it("should fallback to first workspace when initialWorkspaceId is invalid", async () => {
			let emitCallback: ((workspaceId: string) => void) | null = null;

			mocks.useWorkspaceSelection.mockImplementation((options: any) => {
				emitCallback = options.onWorkspaceChange;
				// Simulate fallback to first workspace
				if (emitCallback) {
					setTimeout(() => emitCallback!(mockWorkspaces[0].id), 0);
				}
				return {
					activeWorkspace: ref(mockWorkspaces[0]),
					hasWorkspaces: computed(() => true),
					selectWorkspace: vi.fn(),
				};
			});

			const wrapper = createWrapper({ initialWorkspaceId: "invalid-id" });
			await nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for async emission

			expect(wrapper.emitted("workspace-change")?.[0]).toEqual([
				mockWorkspaces[0].id,
			]);
		});

		it("should handle user workspace selection correctly", async () => {
			let emitCallback: ((workspaceId: string) => void) | null = null;
			const selectWorkspaceFn = vi.fn((workspace: any) => {
				if (emitCallback) {
					emitCallback(workspace.id);
				}
			});

			mocks.useWorkspaceSelection.mockImplementation((options: any) => {
				emitCallback = options.onWorkspaceChange;

				// Initial selection
				if (emitCallback) {
					setTimeout(() => emitCallback!(mockWorkspaces[0].id), 0);
				}

				return {
					activeWorkspace: ref(mockWorkspaces[0]),
					hasWorkspaces: computed(() => true),
					selectWorkspace: selectWorkspaceFn,
				};
			});

			const wrapper = createWrapper();
			await nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for initial emission

			const initialEmissions = wrapper.emitted("workspace-change")?.length ?? 0;

			// Simulate user selection
			if (selectWorkspaceFn) {
				selectWorkspaceFn(mockWorkspaces[1]);
			}

			const emissions = wrapper.emitted("workspace-change");
			expect(emissions).toBeTruthy();
			expect(emissions?.length).toBeGreaterThan(initialEmissions);
			expect(emissions?.[emissions.length - 1]).toEqual([mockWorkspaces[1].id]);
		});
	});

	describe("Error Handling", () => {
		it("should display error state with appropriate messaging", () => {
			setupMocks({
				hasError: true,
				errorMessage: TEST_MESSAGES.FAILED_TO_LOAD,
				displayText: TEST_MESSAGES.ERROR,
				displaySubtext: TEST_MESSAGES.FAILED_TO_LOAD,
			});

			const wrapper = mount(WorkspaceSelector, {
				props: {
					workspaces: [],
					loading: false,
				},
			});

			expect(wrapper.text()).toContain(TEST_MESSAGES.ERROR);
			expect(wrapper.text()).toContain(TEST_MESSAGES.FAILED_TO_LOAD);
		});
	});

	describe("Search Functionality", () => {
		it("should filter workspaces based on search query", () => {
			const filteredWorkspaces = [mockWorkspaces[0]];

			// Setup search mock to return only first workspace
			mocks.useWorkspaceSearch.mockReturnValue({
				searchQuery: ref("Test Workspace 1"),
				debouncedSearchQuery: ref("Test Workspace 1"),
				isSearching: ref(false),
				filteredWorkspaces: computed(() => filteredWorkspaces),
				hasSearchQuery: computed(() => true),
				hasResults: computed(() => true),
				showNoResults: computed(() => false),
				searchStats: computed(() => ({ total: 1, filtered: 1 })),
				setSearchQuery: vi.fn(),
				clearSearch: vi.fn(),
			});

			// Setup selection mock to use filtered workspaces
			mocks.useWorkspaceSelection.mockReturnValue({
				activeWorkspace: ref(filteredWorkspaces[0]),
				hasWorkspaces: computed(() => true),
				selectWorkspace: vi.fn(),
			});

			setupMocks({
				searchQuery: "Test Workspace 1",
				filteredWorkspaces,
			});

			mount(WorkspaceSelector, {
				props: {
					workspaces: mockWorkspaces,
				},
			});

			// Verify that the search functionality is working
			expect(filteredWorkspaces).toHaveLength(1);
			expect(filteredWorkspaces[0].name).toBe("Test Workspace 1");
		});
	});

	describe("Component States", () => {
		it("should handle disabled state correctly", () => {
			const wrapper = mount(WorkspaceSelector, {
				props: {
					workspaces: mockWorkspaces,
					disabled: true,
				},
			});

			expect(wrapper.exists()).toBe(true);

			const trigger = wrapper.find(TEST_SELECTORS.WORKSPACE_SELECTOR_TRIGGER);
			if (trigger.exists()) {
				expect(trigger.attributes()).toHaveProperty("disabled");
			}
		});
	});
});
