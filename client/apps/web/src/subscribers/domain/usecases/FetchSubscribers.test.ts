/**
 * Unit tests for FetchSubscribers use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Subscriber } from "../models";
import { SubscriberStatus } from "../models";
import type { SubscriberRepository } from "../repositories";
import { FetchSubscribers } from "./FetchSubscribers";

// Mock repository
const mockRepository: SubscriberRepository = {
	fetchAll: vi.fn(),
	countByStatus: vi.fn(),
	countByTags: vi.fn(),
};

// Test data
const mockSubscribers: Subscriber[] = [
	{
		id: "123e4567-e89b-12d3-a456-426614174000",
		email: "john.doe@example.com",
		name: "John Doe",
		status: SubscriberStatus.ENABLED,
		workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "123e4567-e89b-12d3-a456-426614174002",
		email: "jane.smith@example.com",
		name: "Jane Smith",
		status: SubscriberStatus.DISABLED,
		workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
	},
	{
		id: "123e4567-e89b-12d3-a456-426614174003",
		email: "bob.wilson@example.com",
		status: SubscriberStatus.BLOCKLISTED,
		workspaceId: "123e4567-e89b-12d3-a456-426614174001",
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
	},
];

describe("FetchSubscribers", () => {
	let useCase: FetchSubscribers;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new FetchSubscribers(mockRepository);
	});

	describe("execute", () => {
		it("should fetch subscribers successfully without filters", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				workspaceId,
				undefined,
			);
			expect(result).toEqual(mockSubscribers);
		});

		it("should fetch subscribers with filters", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { status: "ENABLED", email: "john" };
			const expectedRepositoryFilters = { status: "ENABLED", email: "john" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue([
				mockSubscribers[0],
			]);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				workspaceId,
				expectedRepositoryFilters,
			);
			expect(result).toEqual([mockSubscribers[0]]);
		});

		it("should sanitize filters by removing undefined values", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { status: "ENABLED", email: undefined, name: "" };
			const expectedRepositoryFilters = { status: "ENABLED" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue([
				mockSubscribers[0],
			]);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(mockRepository.fetchAll).toHaveBeenCalledWith(
				workspaceId,
				expectedRepositoryFilters,
			);
			expect(result).toEqual([mockSubscribers[0]]);
		});

		it("should apply case-insensitive email filtering", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { email: "JOHN" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0].email).toBe("john.doe@example.com");
		});

		it("should apply case-insensitive name filtering", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { name: "jane" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("Jane Smith");
		});

		it("should filter out subscribers without names when name filter is applied", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { name: "bob" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(result).toHaveLength(0); // Bob Wilson has no name property
		});

		it("should throw error for empty workspace ID", async () => {
			// Arrange
			const workspaceId = "";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.fetchAll).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only workspace ID", async () => {
			// Arrange
			const workspaceId = "   ";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.fetchAll).not.toHaveBeenCalled();
		});

		it("should propagate repository errors", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const repositoryError = new Error("Repository connection failed");
			vi.mocked(mockRepository.fetchAll).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Repository connection failed",
			);
		});

		it("should handle empty results from repository", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.fetchAll).mockResolvedValue([]);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toEqual([]);
		});

		it("should combine multiple filters correctly", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const filters = { email: "jane", name: "smith" };
			vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers);

			// Act
			const result = await useCase.execute(workspaceId, filters);

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0].email).toBe("jane.smith@example.com");
			expect(result[0].name).toBe("Jane Smith");
		});
	});
});
