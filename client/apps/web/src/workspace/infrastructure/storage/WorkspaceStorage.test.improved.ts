/**
 * Improved version of WorkspaceStorage tests
 * Demonstrates better practices for mock management and type safety
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import {
	EmptyWorkspaceIdError,
	InvalidWorkspaceIdError,
	type WorkspaceStorage,
} from "./WorkspaceStorage";

// Mock the useLocalStorage composable at module level
vi.mock("@/composables/useLocalStorage", () => ({
	useLocalStorage: vi.fn(),
}));

describe("WorkspaceStorage", () => {
	let storage: WorkspaceStorage;
	let mockState: any;
	let mockSetState: ReturnType<typeof vi.fn>;

	// Test constants for better maintainability
	const TEST_DATA = {
		VALID_UUID: "123e4567-e89b-12d3-a456-426614174000",
		INVALID_UUID: "invalid-uuid",
		MALFORMED_UUID: "123e4567-e89b-12d3-a456-42661417400", // Missing last digit
		EMPTY_STRING: "",
		WHITESPACE_STRING: "   ",
	} as const;

	// Helper function for type-safe invalid value testing
	const setInvalidMockValue = (value: unknown) => {
		// Type assertion only in test helper, not throughout tests
		(mockState as { value: unknown }).value = value;
	};

	beforeEach(async () => {
		// Clear all mocks first to ensure clean state
		vi.clearAllMocks();

		// Initialize mock state with proper typing
		mockState = ref<string | null>(null);
		mockSetState = vi.fn((value: string | null) => {
			mockState.value = value;
		});

		// Mock the useLocalStorage function - prefer mockReturnValue for simplicity
		const { useLocalStorage } = await import("@/composables/useLocalStorage");
		vi.mocked(useLocalStorage).mockReturnValue([mockState, mockSetState]);

		// Create fresh storage instance for each test
		const { createWorkspaceStorage } = await import("./WorkspaceStorage");
		storage = createWorkspaceStorage();
	});

	describe("getSelectedWorkspaceId", () => {
		it("should return null when no workspace is stored", () => {
			expect(storage.getSelectedWorkspaceId()).toBeNull();
		});

		it("should return valid UUID when stored", () => {
			mockState.value = TEST_DATA.VALID_UUID;

			expect(storage.getSelectedWorkspaceId()).toBe(TEST_DATA.VALID_UUID);
		});

		it("should clear and return null for invalid UUID format", () => {
			mockState.value = TEST_DATA.INVALID_UUID;

			const result = storage.getSelectedWorkspaceId();

			expect(result).toBeNull();
			expect(mockSetState).toHaveBeenCalledWith(null);
		});

		it("should handle malformed UUIDs gracefully", () => {
			mockState.value = TEST_DATA.MALFORMED_UUID;

			const result = storage.getSelectedWorkspaceId();

			expect(result).toBeNull();
			expect(mockSetState).toHaveBeenCalledWith(null);
		});
	});

	describe("setSelectedWorkspaceId", () => {
		it("should store valid UUID", () => {
			storage.setSelectedWorkspaceId(TEST_DATA.VALID_UUID);

			expect(mockSetState).toHaveBeenCalledWith(TEST_DATA.VALID_UUID);
		});

		it("should throw EmptyWorkspaceIdError for empty string", () => {
			expect(() =>
				storage.setSelectedWorkspaceId(TEST_DATA.EMPTY_STRING),
			).toThrow(EmptyWorkspaceIdError);
			expect(() =>
				storage.setSelectedWorkspaceId(TEST_DATA.WHITESPACE_STRING),
			).toThrow(EmptyWorkspaceIdError);
		});

		it("should throw InvalidWorkspaceIdError for invalid UUID", () => {
			expect(() =>
				storage.setSelectedWorkspaceId(TEST_DATA.INVALID_UUID),
			).toThrow(InvalidWorkspaceIdError);
		});

		it("should trim whitespace from valid UUID", () => {
			const paddedUuid = `  ${TEST_DATA.VALID_UUID}  `;

			storage.setSelectedWorkspaceId(paddedUuid);

			expect(mockSetState).toHaveBeenCalledWith(TEST_DATA.VALID_UUID);
		});
	});

	describe("trySetSelectedWorkspaceId", () => {
		it("should return success for valid UUID", () => {
			const result = storage.trySetSelectedWorkspaceId(TEST_DATA.VALID_UUID);

			expect(result.success).toBe(true);
			expect(mockSetState).toHaveBeenCalledWith(TEST_DATA.VALID_UUID);
		});

		it("should return error for empty string", () => {
			const result = storage.trySetSelectedWorkspaceId(TEST_DATA.EMPTY_STRING);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(EmptyWorkspaceIdError);
			}
		});

		it("should return error for invalid UUID", () => {
			const result = storage.trySetSelectedWorkspaceId(TEST_DATA.INVALID_UUID);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidWorkspaceIdError);
			}
		});
	});

	describe("clearSelectedWorkspaceId", () => {
		it("should clear stored workspace ID", () => {
			storage.clearSelectedWorkspaceId();

			expect(mockSetState).toHaveBeenCalledWith(null);
		});
	});

	describe("hasPersistedWorkspace", () => {
		it("should return false when no workspace is stored", () => {
			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should return true when valid workspace is stored", () => {
			mockState.value = TEST_DATA.VALID_UUID;

			expect(storage.hasPersistedWorkspace()).toBe(true);
		});

		it("should return false when invalid workspace is stored", () => {
			mockState.value = TEST_DATA.INVALID_UUID;

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should return false when malformed workspace is stored", () => {
			mockState.value = TEST_DATA.MALFORMED_UUID;

			expect(storage.hasPersistedWorkspace()).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle null values gracefully", () => {
			mockState.value = null;

			expect(storage.getSelectedWorkspaceId()).toBeNull();
			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should handle undefined values gracefully", () => {
			setInvalidMockValue(undefined);

			expect(storage.getSelectedWorkspaceId()).toBeNull();
			expect(storage.hasPersistedWorkspace()).toBe(false);
		});

		it("should handle non-string values gracefully", () => {
			setInvalidMockValue(123);

			expect(storage.getSelectedWorkspaceId()).toBeNull();
			expect(storage.hasPersistedWorkspace()).toBe(false);
		});
	});
});
