import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { createWorkspaceStorage } from "@/workspace";
import { InvalidWorkspaceIdError } from "@/workspace/domain/errors/WorkspaceErrors";
import {
	EmptyWorkspaceIdError,
	WorkspaceStorageError,
} from "@/workspace/infrastructure/storage/WorkspaceStorage";

vi.mock("@/composables/useLocalStorage", () => ({
	useLocalStorage: vi.fn(() => [ref(null), vi.fn()]),
}));

describe("WorkspaceStorage", () => {
	const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
	const INVALID_UUID = "invalid-uuid";

	let mockSetState: ReturnType<typeof vi.fn>;
	let mockStateRef: ReturnType<typeof ref>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSetState = vi.fn();
		mockStateRef = ref(null);
	});

	describe("getSelectedWorkspaceId", () => {
		it("should return null when no workspace is stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([ref(null), mockSetState]);
			const storage = createWorkspaceStorage();
			expect(storage.getSelectedWorkspaceId()).toBeNull();
		});

		it("should return valid UUID when stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([
				ref(VALID_UUID),
				mockSetState,
			]);
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

	describe("setSelectedWorkspaceId", () => {
		beforeEach(() => {
			vi.mocked(useLocalStorage).mockReturnValue([mockStateRef, mockSetState]);
		});

		it("should store valid UUID", () => {
			const storage = createWorkspaceStorage();
			storage.setSelectedWorkspaceId(VALID_UUID);
			expect(mockSetState).toHaveBeenCalledWith(VALID_UUID);
		});

		it("should store valid UUID after trimming whitespace", () => {
			const storage = createWorkspaceStorage();
			const paddedUUID = `  ${VALID_UUID}  `;
			storage.setSelectedWorkspaceId(paddedUUID);
			expect(mockSetState).toHaveBeenCalledWith(VALID_UUID);
		});

		it("should throw EmptyWorkspaceIdError for empty string", () => {
			const storage = createWorkspaceStorage();
			expect(() => storage.setSelectedWorkspaceId("")).toThrow(
				EmptyWorkspaceIdError,
			);
			expect(() => storage.setSelectedWorkspaceId("   ")).toThrow(
				EmptyWorkspaceIdError,
			);
			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should throw InvalidWorkspaceIdError for invalid UUID format", () => {
			const storage = createWorkspaceStorage();
			expect(() => storage.setSelectedWorkspaceId(INVALID_UUID)).toThrow(
				InvalidWorkspaceIdError,
			);
			expect(() => storage.setSelectedWorkspaceId("not-a-uuid")).toThrow(
				InvalidWorkspaceIdError,
			);
			expect(() => storage.setSelectedWorkspaceId("123")).toThrow(
				InvalidWorkspaceIdError,
			);
			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should handle various invalid UUID formats", () => {
			const storage = createWorkspaceStorage();
			const invalidUUIDs = [
				"123e4567-e89b-12d3-a456", // too short
				"123e4567-e89b-12d3-a456-426614174000-extra", // too long
				"g23e4567-e89b-12d3-a456-426614174000", // invalid hex chars
				"123e4567_e89b_12d3_a456_426614174000", // wrong separators
				"123e4567-e89b-92d3-a456-426614174000", // invalid version (should be 1-5)
			];

			invalidUUIDs.forEach((invalidUUID) => {
				expect(() => storage.setSelectedWorkspaceId(invalidUUID)).toThrow(
					InvalidWorkspaceIdError,
				);
			});

			expect(mockSetState).not.toHaveBeenCalled();
		});
	});

	describe("clearSelectedWorkspaceId", () => {
		it("should clear the stored workspace ID", () => {
			vi.mocked(useLocalStorage).mockReturnValue([mockStateRef, mockSetState]);
			const storage = createWorkspaceStorage();

			storage.clearSelectedWorkspaceId();

			expect(mockSetState).toHaveBeenCalledWith(null);
		});

		it("should work when no workspace was previously stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([ref(null), mockSetState]);
			const storage = createWorkspaceStorage();

			storage.clearSelectedWorkspaceId();

			expect(mockSetState).toHaveBeenCalledWith(null);
		});
	});

	describe("hasPersistedWorkspace", () => {
		it("should return true when valid workspace ID is stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([
				ref(VALID_UUID),
				mockSetState,
			]);
			const storage = createWorkspaceStorage();

			expect(storage.hasPersistedWorkspace()).toBe(true);
		});

		it("should return false when no workspace ID is stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([ref(null), mockSetState]);
			const storage = createWorkspaceStorage();

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should return false when invalid workspace ID is stored", () => {
			vi.mocked(useLocalStorage).mockReturnValue([
				ref(INVALID_UUID),
				mockSetState,
			]);
			const storage = createWorkspaceStorage();

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should return false for empty string", () => {
			vi.mocked(useLocalStorage).mockReturnValue([ref(""), mockSetState]);
			const storage = createWorkspaceStorage();

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should return false for whitespace-only string", () => {
			vi.mocked(useLocalStorage).mockReturnValue([ref("   "), mockSetState]);
			const storage = createWorkspaceStorage();

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});
	});

	describe("trySetSelectedWorkspaceId", () => {
		beforeEach(() => {
			vi.mocked(useLocalStorage).mockReturnValue([mockStateRef, mockSetState]);
		});

		it("should return success result for valid UUID", () => {
			const storage = createWorkspaceStorage();

			const result = storage.trySetSelectedWorkspaceId(VALID_UUID);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeUndefined();
			}
			expect(mockSetState).toHaveBeenCalledWith(VALID_UUID);
		});

		it("should return success result for valid UUID with whitespace", () => {
			const storage = createWorkspaceStorage();
			const paddedUUID = `  ${VALID_UUID}  `;

			const result = storage.trySetSelectedWorkspaceId(paddedUUID);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeUndefined();
			}
			expect(mockSetState).toHaveBeenCalledWith(VALID_UUID);
		});

		it("should return error result for empty workspace ID", () => {
			const storage = createWorkspaceStorage();

			const result = storage.trySetSelectedWorkspaceId("");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(EmptyWorkspaceIdError);
				expect(result.error.code).toBe("EMPTY_WORKSPACE_ID");
				expect(result.error.message).toBe("Workspace ID cannot be empty");
			}
			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should return error result for whitespace-only workspace ID", () => {
			const storage = createWorkspaceStorage();

			const result = storage.trySetSelectedWorkspaceId("   ");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(EmptyWorkspaceIdError);
				expect(result.error.code).toBe("EMPTY_WORKSPACE_ID");
			}
			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should return error result for invalid UUID format", () => {
			const storage = createWorkspaceStorage();

			const result = storage.trySetSelectedWorkspaceId(INVALID_UUID);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidWorkspaceIdError);
				expect(result.error.code).toBe("INVALID_WORKSPACE_ID");
			}
			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should handle multiple invalid UUID formats", () => {
			const storage = createWorkspaceStorage();
			const invalidUUIDs = [
				"not-a-uuid",
				"123",
				"123e4567-e89b-12d3-a456", // too short
				"g23e4567-e89b-12d3-a456-426614174000", // invalid chars
			];

			invalidUUIDs.forEach((invalidUUID) => {
				const result = storage.trySetSelectedWorkspaceId(invalidUUID);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(InvalidWorkspaceIdError);
					expect(result.error.code).toBe("INVALID_WORKSPACE_ID");
				}
			});

			expect(mockSetState).not.toHaveBeenCalled();
		});

		it("should handle unexpected errors gracefully", () => {
			// Mock localStorage to throw an error
			const errorMock = vi.fn().mockImplementation(() => {
				throw new Error("Storage quota exceeded");
			});
			vi.mocked(useLocalStorage).mockReturnValue([mockStateRef, errorMock]);

			const storage = createWorkspaceStorage();
			const result = storage.trySetSelectedWorkspaceId(VALID_UUID);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(WorkspaceStorageError);
				expect(result.error.code).toBe("UNKNOWN_ERROR");
				expect(result.error.message).toBe("Unknown storage error");
			}
		});
	});
});
