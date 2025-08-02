import { describe, expect, it } from "vitest";
import { ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";
import { useWorkspaceDisplay } from "./useWorkspaceDisplay";

const mockWorkspace: Workspace = {
	id: "1",
	name: "Test Workspace",
	description: "Test description",
	ownerId: "owner1",
	createdAt: "2023-01-01T00:00:00Z",
	updatedAt: "2023-01-01T00:00:00Z",
};

describe("useWorkspaceDisplay", () => {
	it("should show loading state correctly", () => {
		const activeWorkspace = ref<Workspace | null>(null);
		const loading = ref(true);
		const hasWorkspaces = ref(false);

		const { displayText, displaySubtext, showEmptyState } = useWorkspaceDisplay(
			{
				activeWorkspace,
				loading,
				hasWorkspaces,
			},
		);

		expect(displayText.value).toBe("Loading...");
		expect(displaySubtext.value).toBe("Please wait");
		expect(showEmptyState.value).toBe(false);
	});

	it("should show workspace information when active", () => {
		const activeWorkspace = ref(mockWorkspace);
		const loading = ref(false);
		const hasWorkspaces = ref(true);

		const { displayText, displaySubtext } = useWorkspaceDisplay({
			activeWorkspace,
			loading,
			hasWorkspaces,
		});

		expect(displayText.value).toBe("Test Workspace");
		expect(displaySubtext.value).toBe("Test description");
	});

	it("should show fallback text when no description", () => {
		const workspaceWithoutDescription = {
			...mockWorkspace,
			description: undefined,
		};
		const activeWorkspace = ref(workspaceWithoutDescription);
		const loading = ref(false);
		const hasWorkspaces = ref(true);

		const { displaySubtext } = useWorkspaceDisplay({
			activeWorkspace,
			loading,
			hasWorkspaces,
		});

		expect(displaySubtext.value).toBe("Workspace");
	});

	it("should show empty state when no workspaces and not loading", () => {
		const activeWorkspace = ref<Workspace | null>(null);
		const loading = ref(false);
		const hasWorkspaces = ref(false);

		const { displayText, displaySubtext, showEmptyState } = useWorkspaceDisplay(
			{
				activeWorkspace,
				loading,
				hasWorkspaces,
			},
		);

		expect(displayText.value).toBe("No workspace selected");
		expect(displaySubtext.value).toBe("Select a workspace");
		expect(showEmptyState.value).toBe(true);
	});

	it("should correctly identify active workspace", () => {
		const activeWorkspace = ref(mockWorkspace);
		const loading = ref(false);
		const hasWorkspaces = ref(true);

		const { isWorkspaceActive } = useWorkspaceDisplay({
			activeWorkspace,
			loading,
			hasWorkspaces,
		});

		expect(isWorkspaceActive(mockWorkspace)).toBe(true);
		expect(isWorkspaceActive({ ...mockWorkspace, id: "different" })).toBe(
			false,
		);
	});
});
