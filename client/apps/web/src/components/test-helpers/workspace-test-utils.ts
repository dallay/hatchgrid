import { type MockedFunction, vi } from "vitest";
import { computed, ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";

// Define proper types for composable return values
type WorkspaceSelectionComposable = {
	activeWorkspace: ReturnType<typeof ref<Workspace | null>>;
	hasWorkspaces: ReturnType<typeof computed<boolean>>;
	selectWorkspace: MockedFunction<(workspace: Workspace) => boolean>;
};

type WorkspaceDisplayComposable = {
	displayText: ReturnType<typeof computed<string>>;
	displaySubtext: ReturnType<typeof computed<string>>;
	showEmptyState: ReturnType<typeof computed<boolean>>;
	isWorkspaceActive: MockedFunction<(workspace: Workspace) => boolean>;
};

type WorkspaceErrorHandlingComposable = {
	hasError: ReturnType<typeof ref<boolean>>;
	errorMessage: ReturnType<typeof ref<string>>;
	isRetryable: ReturnType<typeof ref<boolean>>;
	getErrorTitle: MockedFunction<() => string>;
	getErrorDescription: MockedFunction<() => string>;
	handleError: MockedFunction<(error: unknown, context?: string) => void>;
	handleRetry: MockedFunction<() => Promise<void>>;
	showSuccessToast: MockedFunction<(title: string, description?: string) => void>;
};

type WorkspaceSearchComposable = {
	searchQuery: ReturnType<typeof ref<string>>;
	filteredWorkspaces: ReturnType<typeof computed<Workspace[]>>;
	clearSearch: MockedFunction<() => void>;
};

export const createMockWorkspace = (
	overrides: Partial<Workspace> = {},
): Workspace => ({
	id: "test-id",
	name: "Test Workspace",
	description: "Test Description",
	ownerId: "test-owner",
	createdAt: "2023-01-01T00:00:00Z",
	updatedAt: "2023-01-01T00:00:00Z",
	...overrides,
});

export const createMockWorkspaces = (count = 2): Workspace[] =>
	Array.from({ length: count }, (_, index) =>
		createMockWorkspace({
			id: `${index + 1}`,
			name: `Test Workspace ${index + 1}`,
			description: `${index === 0 ? "First" : "Second"} test workspace`,
			ownerId: `owner${index + 1}`,
			createdAt: `2023-01-0${index + 1}T00:00:00Z`,
			updatedAt: `2023-01-0${index + 1}T00:00:00Z`,
		}),
	);

export interface MockComposableSetup {
	activeWorkspace?: Workspace | null;
	hasWorkspaces?: boolean;
	displayText?: string;
	displaySubtext?: string;
	showEmptyState?: boolean;
	hasError?: boolean;
	errorMessage?: string;
	searchQuery?: string;
	filteredWorkspaces?: Workspace[];
}

export const setupWorkspaceMocks = (
	mocks: {
		useWorkspaceSelection: MockedFunction<() => WorkspaceSelectionComposable>;
		useWorkspaceDisplay: MockedFunction<() => WorkspaceDisplayComposable>;
		useWorkspaceErrorHandling: MockedFunction<() => WorkspaceErrorHandlingComposable>;
		useWorkspaceSearch: MockedFunction<() => WorkspaceSearchComposable>;
	},
	setup: MockComposableSetup = {},
) => {
	const {
		activeWorkspace = null,
		hasWorkspaces = false,
		displayText = "Test Workspace",
		displaySubtext = "Test Description",
		showEmptyState = false,
		hasError = false,
		errorMessage = "",
		searchQuery = "",
		filteredWorkspaces = [],
	} = setup;

	const selectedWorkspace = ref(activeWorkspace);

	mocks.useWorkspaceSelection.mockReturnValue({
		activeWorkspace: selectedWorkspace,
		hasWorkspaces: computed(() => hasWorkspaces),
		selectWorkspace: vi.fn((workspace: Workspace) => {
			selectedWorkspace.value = workspace;
			return true;
		}),
	});

	mocks.useWorkspaceDisplay.mockReturnValue({
		displayText: computed(() => displayText),
		displaySubtext: computed(() => displaySubtext),
		showEmptyState: computed(() => showEmptyState),
		isWorkspaceActive: vi.fn(() => activeWorkspace !== null),
	});

	mocks.useWorkspaceErrorHandling.mockReturnValue({
		hasError: ref(hasError),
		errorMessage: ref(errorMessage),
		isRetryable: ref(true),
		getErrorTitle: vi.fn(() => "Error"),
		getErrorDescription: vi.fn(() => errorMessage),
		handleError: vi.fn(),
		handleRetry: vi.fn(),
		showSuccessToast: vi.fn(),
	});

	mocks.useWorkspaceSearch.mockReturnValue({
		searchQuery: ref(searchQuery),
		filteredWorkspaces: computed(() => filteredWorkspaces),
		clearSearch: vi.fn(),
	});

	return {
		selectedWorkspace,
		onWorkspaceSelected: computed(() => (id: string) => {
			const workspace = filteredWorkspaces.find(w => w.id === id);
			if (workspace) {
				mocks.useWorkspaceSelection().selectWorkspace(workspace);
			}
		}),
	};
};
