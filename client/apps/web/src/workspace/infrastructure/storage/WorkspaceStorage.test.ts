import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { createWorkspaceStorage } from "@/workspace";

vi.mock("@/composables/useLocalStorage", () => ({
	useLocalStorage: vi.fn(() => [ref(null), vi.fn()]),
}));

describe("WorkspaceStorage", () => {
	const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
	const INVALID_UUID = "invalid-uuid";

	let mockSetState: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSetState = vi.fn();
	});

	it("should return null when no workspace is stored", () => {
		vi.mocked(useLocalStorage).mockReturnValue([ref(null), mockSetState]);
		const storage = createWorkspaceStorage();
		expect(storage.getSelectedWorkspaceId()).toBeNull();
	});

	it("should return valid UUID when stored", () => {
		vi.mocked(useLocalStorage).mockReturnValue([ref(VALID_UUID), mockSetState]);
		const storage = createWorkspaceStorage();
		expect(storage.getSelectedWorkspaceId()).toBe(VALID_UUID);
	});

	it("should clear and return null for invalid UUID format", () => {
		vi.mocked(useLocalStorage).mockReturnValue([
			ref(INVALID_UUID),
			mockSetState,
		]);
		const storage = createWorkspaceStorage();
		const result = storage.getSelectedWorkspaceId();
		expect(result).toBeNull();
		expect(mockSetState).toHaveBeenCalledWith(null);
	});
});
