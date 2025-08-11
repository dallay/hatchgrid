import { type MockedFunction, vi } from "vitest";
import { type ComputedRef, computed, type Ref, ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";

// Define proper types for composable return values
type WorkspaceSelectionComposable = {
	activeWorkspace: Ref<Workspace | null>;
	hasWorkspaces: ComputedRef<boolean>;
	selectWorkspace: MockedFunction<(workspace: Workspace) => boolean>;
};

type WorkspaceDisplayComposable = {
	displayText: ComputedRef<string>;
	displaySubtext: ComputedRef<string>;
	showEmptyState: ComputedRef<boolean>;
	isWorkspaceActive: MockedFunction<(workspace: Workspace) => boolean>;
};

type WorkspaceErrorHandlingComposable = {
	hasError: Ref<boolean>;
	errorMessage: Ref<string>;
	isRetryable: Ref<boolean>;
	getErrorTitle: MockedFunction<() => string>;
	getErrorDescription: MockedFunction<() => string>;
	handleError: MockedFunction<(error: unknown, context?: string) => void>;
	handleRetry: MockedFunction<() => Promise<void>>;
	showSuccessToast: MockedFunction<
		(title: string, description?: string) => void
	>;
};

type WorkspaceSearchComposable = {
	searchQuery: Ref<string>;
	filteredWorkspaces: ComputedRef<Workspace[]>;
	clearSearch: MockedFunction<() => void>;
};

// Constants for better maintainability and consistency
const DEFAULT_WORKSPACE_DATA = {
	id: "test-workspace-id",
	name: "Test Workspace",
	description: "Test Description",
	ownerId: "test-owner-id",
	isDefault: false,
	createdAt: "2023-01-01T00:00:00Z",
	updatedAt: "2023-01-01T00:00:00Z",
} as const;

export const createMockWorkspace = (
	overrides: Partial<Workspace> = {},
): Workspace => ({
	...DEFAULT_WORKSPACE_DATA,
	...overrides,
});

/**
 * Returns an ISO date string for a given year, month, and day.
 * Useful for generating consistent test dates.
 * @param day - Day of the month (1-31)
 * @param month - Month (1-12), defaults to 1 (January)
 * @param year - Year, defaults to 2023
 * @returns ISO date string (e.g., 2023-01-05T00:00:00Z)
 */
export function getTestIsoDate(day: number, month = 1, year = 2023): string {
	const paddedMonth = month.toString().padStart(2, "0");
	const paddedDay = day.toString().padStart(2, "0");
	return `${year}-${paddedMonth}-${paddedDay}T00:00:00Z`;
}
export const createMockWorkspaces = (count = 2): Workspace[] =>
	Array.from({ length: count }, (_, index) => {
		const workspaceNumber = index + 1;
		return createMockWorkspace({
			id: crypto.randomUUID(),
			name: `Test Workspace ${workspaceNumber}`,
			description: `Test workspace ${workspaceNumber} description`,
			ownerId: `test-owner-${workspaceNumber}`,
			createdAt: getTestIsoDate(workspaceNumber),
			updatedAt: getTestIsoDate(workspaceNumber),
		});
	});

export interface MockComposableSetup {
	readonly activeWorkspace?: Workspace | null;
	readonly hasWorkspaces?: boolean;
	readonly displayText?: string;
	readonly displaySubtext?: string;
	readonly showEmptyState?: boolean;
	readonly hasError?: boolean;
	readonly errorMessage?: string;
	readonly searchQuery?: string;
	readonly filteredWorkspaces?: Workspace[];
}

export const setupWorkspaceMocks = (
	mocks: {
		useWorkspaceSelection: MockedFunction<() => WorkspaceSelectionComposable>;
		useWorkspaceDisplay: MockedFunction<() => WorkspaceDisplayComposable>;
		useWorkspaceErrorHandling: MockedFunction<
			() => WorkspaceErrorHandlingComposable
		>;
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
		isWorkspaceActive: vi.fn(
			(workspace: Workspace) => activeWorkspace?.id === workspace.id,
		),
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
		onWorkspaceSelected: ref((id: string) => {
			const workspace = filteredWorkspaces.find((w) => w.id === id);
			if (workspace) {
				mocks.useWorkspaceSelection().selectWorkspace(workspace);
			}
		}),
	};
};
