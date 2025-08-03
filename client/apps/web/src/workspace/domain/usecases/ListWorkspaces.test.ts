import { beforeEach, describe, expect, it, vi } from "vitest";
import type CollectionResponse from "@/shared/response/CollectionResponse.ts";
import { WorkspaceApiError } from "../errors/WorkspaceErrors.ts";
import type { Workspace } from "../models/Workspace.ts";
import type { WorkspaceRepository } from "../repositories/WorkspaceRepository.ts";
import { ListWorkspaces } from "./ListWorkspaces.ts";

describe("ListWorkspaces", () => {
	let mockRepository: WorkspaceRepository;
	let listWorkspaces: ListWorkspaces;

	const mockWorkspaces: Workspace[] = [
		{
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Workspace 1",
			description: "First test workspace",
			ownerId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		{
			id: "123e4567-e89b-12d3-a456-426614174002",
			name: "Test Workspace 2",
			ownerId: "123e4567-e89b-12d3-a456-426614174003",
			createdAt: "2024-01-02T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		},
	];

	beforeEach(() => {
		mockRepository = {
			list: vi.fn(),
			getById: vi.fn(),
		};
		listWorkspaces = new ListWorkspaces(mockRepository);
	});

	describe("execute", () => {
		it("should return workspaces array when repository returns successful response", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: mockWorkspaces,
			};
			vi.mocked(mockRepository.list).mockResolvedValue(mockResponse);

			// Act
			const result = await listWorkspaces.execute();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(mockRepository.list).toHaveBeenCalledOnce();
		});

		it("should return empty array when repository returns empty response", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [],
			};
			vi.mocked(mockRepository.list).mockResolvedValue(mockResponse);

			// Act
			const result = await listWorkspaces.execute();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(mockRepository.list).toHaveBeenCalledOnce();
		});

		it("should throw WorkspaceApiError when repository throws generic error", async () => {
			// Arrange
			const error = new Error("Network error");
			vi.mocked(mockRepository.list).mockRejectedValue(error);

			// Act & Assert
			await expect(listWorkspaces.execute()).rejects.toThrow(WorkspaceApiError);
			await expect(listWorkspaces.execute()).rejects.toThrow(
				"Workspace API error during list workspaces",
			);
			expect(mockRepository.list).toHaveBeenCalledTimes(2);
		});

		it("should re-throw WorkspaceApiError when repository throws domain error", async () => {
			// Arrange
			const domainError = new WorkspaceApiError("list workspaces", 500);
			vi.mocked(mockRepository.list).mockRejectedValue(domainError);

			// Act & Assert
			await expect(listWorkspaces.execute()).rejects.toThrow(domainError);
			expect(mockRepository.list).toHaveBeenCalledOnce();
		});

		it("should call repository list method exactly once", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: mockWorkspaces,
			};
			vi.mocked(mockRepository.list).mockResolvedValue(mockResponse);

			// Act
			await listWorkspaces.execute();

			// Assert
			expect(mockRepository.list).toHaveBeenCalledTimes(1);
			expect(mockRepository.list).toHaveBeenCalledWith();
		});
	});
});
