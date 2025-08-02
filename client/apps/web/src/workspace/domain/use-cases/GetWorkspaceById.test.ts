import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SingleItemResponse } from "@/shared/index.ts";
import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
} from "../errors/WorkspaceErrors.ts";
import type { Workspace } from "../models/Workspace.ts";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository.ts";
import { GetWorkspaceById } from "./GetWorkspaceById.ts";

describe("GetWorkspaceById", () => {
	let mockRepository: WorkspaceRepository;
	let getWorkspaceById: GetWorkspaceById;

	// Test data constants
	const TEST_WORKSPACE_ID = "123e4567-e89b-12d3-a456-426614174000";
	const TEST_OWNER_ID = "123e4567-e89b-12d3-a456-426614174001";

	// Test helper functions
	const createSuccessResponse = (
		workspace: Workspace,
	): SingleItemResponse<Workspace> => ({
		data: workspace,
	});

	const createTestWorkspace = (
		overrides: Partial<Workspace> = {},
	): Workspace => ({
		id: TEST_WORKSPACE_ID,
		name: "Test Workspace",
		description: "A test workspace",
		ownerId: TEST_OWNER_ID,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		...overrides,
	});

	const mockWorkspace = createTestWorkspace();

	beforeEach(() => {
		mockRepository = {
			list: vi.fn(),
			getById: vi.fn(),
		};
		getWorkspaceById = new GetWorkspaceById(mockRepository);
	});

	describe("execute", () => {
		describe("successful scenarios", () => {
			it("should return workspace when repository returns successful response", async () => {
				// Arrange
				const mockResponse = createSuccessResponse(mockWorkspace);
				vi.mocked(mockRepository.getById).mockResolvedValue(mockResponse);

				// Act
				const result = await getWorkspaceById.execute(TEST_WORKSPACE_ID);

				// Assert
				expect(result).toEqual(mockWorkspace);
				expect(mockRepository.getById).toHaveBeenCalledOnce();
				expect(mockRepository.getById).toHaveBeenCalledWith(TEST_WORKSPACE_ID);
			});

			it("should return null when workspace does not exist", async () => {
				// Arrange
				vi.mocked(mockRepository.getById).mockResolvedValue(null);

				// Act
				const result = await getWorkspaceById.execute(TEST_WORKSPACE_ID);

				// Assert
				expect(result).toBeNull();
				expect(mockRepository.getById).toHaveBeenCalledOnce();
				expect(mockRepository.getById).toHaveBeenCalledWith(TEST_WORKSPACE_ID);
			});
		});

		describe("error scenarios", () => {
			it("should throw WorkspaceApiError when repository throws generic error", async () => {
				// Arrange
				const error = new Error("Network error");
				vi.mocked(mockRepository.getById).mockRejectedValue(error);

				// Act & Assert
				await expect(
					getWorkspaceById.execute(TEST_WORKSPACE_ID),
				).rejects.toThrow(WorkspaceApiError);
				await expect(
					getWorkspaceById.execute(TEST_WORKSPACE_ID),
				).rejects.toThrow("Workspace API error during get workspace");
				expect(mockRepository.getById).toHaveBeenCalledTimes(2);
			});

			it("should re-throw domain errors when repository throws them", async () => {
				// Arrange
				const domainError = new WorkspaceApiError("get workspace", 500);
				vi.mocked(mockRepository.getById).mockRejectedValue(domainError);

				// Act & Assert
				await expect(
					getWorkspaceById.execute(TEST_WORKSPACE_ID),
				).rejects.toThrow(domainError);
				expect(mockRepository.getById).toHaveBeenCalledOnce();
			});
		});

		describe("input validation", () => {
			it("should throw InvalidWorkspaceIdError when ID is not a valid UUID", async () => {
				// Arrange
				const invalidIds = [
					"invalid-uuid",
					"123",
					"",
					"123e4567-e89b-12d3-a456-42661417400", // too short
					"123e4567-e89b-12d3-a456-4266141740000", // too long
					"123e4567-e89b-12d3-a456-426614174g00", // invalid character
					"123e4567-e89b-12d3-a456-426614174000-extra", // extra characters
				];

				// Act & Assert
				for (const invalidId of invalidIds) {
					await expect(getWorkspaceById.execute(invalidId)).rejects.toThrow(
						InvalidWorkspaceIdError,
					);
					await expect(getWorkspaceById.execute(invalidId)).rejects.toThrow(
						`Invalid workspace ID format: ${invalidId}`,
					);
				}
				expect(mockRepository.getById).not.toHaveBeenCalled();
			});

			it("should accept valid UUID formats", async () => {
				// Arrange
				const validUUIDs = [
					"123e4567-e89b-12d3-a456-426614174000",
					"550e8400-e29b-41d4-a716-446655440000",
					"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
					"6ba7b811-9dad-11d1-80b4-00c04fd430c8",
					// Note: all-zeros UUID doesn't match strict UUID v1-5 format
					"f47ac10b-58cc-4372-a567-0e02b2c3d479",
				];

				vi.mocked(mockRepository.getById).mockResolvedValue(null);

				// Act & Assert
				for (const uuid of validUUIDs) {
					await expect(getWorkspaceById.execute(uuid)).resolves.toBeNull();
				}
				expect(mockRepository.getById).toHaveBeenCalledTimes(validUUIDs.length);
			});

			it("should accept UUIDs regardless of case", async () => {
				// Arrange
				const uuidVariations = [
					"123E4567-E89B-12D3-A456-426614174000", // uppercase
					"123e4567-e89b-12d3-a456-426614174000", // lowercase
					"123E4567-e89b-12D3-A456-426614174000", // mixed case
				];

				vi.mocked(mockRepository.getById).mockResolvedValue(null);

				// Act & Assert
				for (const uuid of uuidVariations) {
					await expect(getWorkspaceById.execute(uuid)).resolves.toBeNull();
				}

				expect(mockRepository.getById).toHaveBeenCalledTimes(
					uuidVariations.length,
				);
			});
		});

		describe("edge cases", () => {
			it("should handle malformed response data gracefully", async () => {
				// Test various malformed response scenarios
				const malformedResponses = [
					{} as SingleItemResponse<Workspace>, // empty response
					{ data: null as unknown as Workspace }, // null data
					{ data: undefined } as unknown as SingleItemResponse<Workspace>, // undefined data
				];

				for (const response of malformedResponses) {
					vi.mocked(mockRepository.getById).mockResolvedValue(response);
					const result = await getWorkspaceById.execute(TEST_WORKSPACE_ID);
					expect(result).toBeNull();
				}

				expect(mockRepository.getById).toHaveBeenCalledTimes(
					malformedResponses.length,
				);
			});

			it("should wrap repository errors in WorkspaceApiError", async () => {
				// Arrange
				const repositoryError = new Error("Database connection failed");
				vi.mocked(mockRepository.getById).mockRejectedValue(repositoryError);

				// Act & Assert
				await expect(
					getWorkspaceById.execute(TEST_WORKSPACE_ID),
				).rejects.toThrow(WorkspaceApiError);
				await expect(
					getWorkspaceById.execute(TEST_WORKSPACE_ID),
				).rejects.toThrow("Workspace API error during get workspace");
				expect(mockRepository.getById).toHaveBeenCalledTimes(2);
			});
		});
	});
});
