import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import type { Workspace } from "@/workspace/domain/models";
import { useWorkspaceSelection } from "./useWorkspaceSelection";

const mockWorkspaces: Workspace[] = [
	{
		id: "1",
		name: "Test Workspace 1",
		description: "First test workspace",
		ownerId: "owner1",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
	},
	{
		id: "2",
		name: "Test Workspace 2",
		description: "Second test workspace",
		ownerId: "owner2",
		createdAt: "2023-01-02T00:00:00Z",
		updatedAt: "2023-01-02T00:00:00Z",
	},
];

describe("useWorkspaceSelection", () => {
	it("should initialize with first workspace when no initial ID provided", () => {
		const workspaces = ref(mockWorkspaces);
		const onWorkspaceChange = vi.fn();

		const { activeWorkspace } = useWorkspaceSelection({
			workspaces,
			onWorkspaceChange,
		});

		expect(activeWorkspace.value).toEqual(mockWorkspaces[0]);
		expect(onWorkspaceChange).toHaveBeenCalledWith("1");
	});

	it("should use initial workspace ID when provided and valid", () => {
		const workspaces = ref(mockWorkspaces);
		const initialWorkspaceId = ref("2");
		const onWorkspaceChange = vi.fn();

		const { activeWorkspace } = useWorkspaceSelection({
			workspaces,
			initialWorkspaceId,
			onWorkspaceChange,
		});

		expect(activeWorkspace.value).toEqual(mockWorkspaces[1]);
		expect(onWorkspaceChange).toHaveBeenCalledWith("2");
	});

	it("should fall back to first workspace when initial ID is invalid", () => {
		const workspaces = ref(mockWorkspaces);
		const initialWorkspaceId = ref("invalid-id");
		const onWorkspaceChange = vi.fn();

		const { activeWorkspace } = useWorkspaceSelection({
			workspaces,
			initialWorkspaceId,
			onWorkspaceChange,
		});

		expect(activeWorkspace.value).toEqual(mockWorkspaces[0]);
		expect(onWorkspaceChange).toHaveBeenCalledWith("1");
	});

	it("should handle empty workspace list", () => {
		const workspaces = ref<Workspace[]>([]);
		const onWorkspaceChange = vi.fn();

		const { activeWorkspace, hasWorkspaces } = useWorkspaceSelection({
			workspaces,
			onWorkspaceChange,
		});

		expect(activeWorkspace.value).toBeNull();
		expect(hasWorkspaces.value).toBe(false);
		expect(onWorkspaceChange).not.toHaveBeenCalled();
	});

	it("should update when workspaces change", async () => {
		const workspaces = ref<Workspace[]>([]);
		const onWorkspaceChange = vi.fn();

		const { activeWorkspace } = useWorkspaceSelection({
			workspaces,
			onWorkspaceChange,
		});

		expect(activeWorkspace.value).toBeNull();

		// Add workspaces
		workspaces.value = mockWorkspaces;
		await nextTick();

		expect(activeWorkspace.value).toEqual(mockWorkspaces[0]);
		expect(onWorkspaceChange).toHaveBeenCalledWith("1");
	});

	it("should validate workspace before selection", () => {
		const workspaces = ref(mockWorkspaces);
		const onWorkspaceChange = vi.fn();
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const { selectWorkspace } = useWorkspaceSelection({
			workspaces,
			onWorkspaceChange,
		});

		// Try to select invalid workspace
		const result = selectWorkspace(null);

		expect(result).toBe(false);
		expect(consoleSpy).toHaveBeenCalledWith('Invalid workspace selected:', null);

		consoleSpy.mockRestore();
	});

	it("should not emit change event when selecting same workspace", () => {
		const workspaces = ref(mockWorkspaces);
		const onWorkspaceChange = vi.fn();

		const { selectWorkspace } = useWorkspaceSelection({
			workspaces,
			onWorkspaceChange,
		});

		// Clear initial call
		onWorkspaceChange.mockClear();

		// Select same workspace
		const result = selectWorkspace(mockWorkspaces[0]);

		expect(result).toBe(false);
		expect(onWorkspaceChange).not.toHaveBeenCalled();
	});
});
