/**
 * Unit tests for CountByStatus use case
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CountByStatusResponse } from "../models";
import { SubscriberStatus } from "../models";
import type { SubscriberRepository } from "../repositories";
import { CountByStatus } from "./CountByStatus";

// Mock repository
const mockRepository: SubscriberRepository = {
	fetchAll: vi.fn(),
	countByStatus: vi.fn(),
	countByTags: vi.fn(),
};

// Test data
const mockCountByStatusResponse: CountByStatusResponse[] = [
	{ count: 10, status: SubscriberStatus.ENABLED },
	{ count: 5, status: SubscriberStatus.DISABLED },
	{ count: 2, status: SubscriberStatus.BLOCKLISTED },
];

describe("CountByStatus", () => {
	let useCase: CountByStatus;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new CountByStatus(mockRepository);
	});

	describe("execute", () => {
		it("should count subscribers by status successfully", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				mockCountByStatusResponse,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(mockRepository.countByStatus).toHaveBeenCalledWith(workspaceId);
			expect(result).toHaveLength(3);
			expect(result).toEqual(
				expect.arrayContaining([
					{ count: 10, status: SubscriberStatus.ENABLED },
					{ count: 5, status: SubscriberStatus.DISABLED },
					{ count: 2, status: SubscriberStatus.BLOCKLISTED },
				]),
			);
		});

		it("should fill missing statuses with zero counts", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const partialResponse: CountByStatusResponse[] = [
				{ count: 10, status: SubscriberStatus.ENABLED },
			];
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				partialResponse,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toHaveLength(3);
			expect(result).toEqual(
				expect.arrayContaining([
					{ count: 10, status: SubscriberStatus.ENABLED },
					{ count: 0, status: SubscriberStatus.DISABLED },
					{ count: 0, status: SubscriberStatus.BLOCKLISTED },
				]),
			);
		});

		it("should handle empty response from repository", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByStatus).mockResolvedValue([]);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toHaveLength(3);
			expect(result).toEqual([
				{ count: 0, status: SubscriberStatus.ENABLED },
				{ count: 0, status: SubscriberStatus.DISABLED },
				{ count: 0, status: SubscriberStatus.BLOCKLISTED },
			]);
		});

		it("should throw error for empty workspace ID", async () => {
			// Arrange
			const workspaceId = "";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.countByStatus).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only workspace ID", async () => {
			// Arrange
			const workspaceId = "   ";

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Workspace ID is required",
			);
			expect(mockRepository.countByStatus).not.toHaveBeenCalled();
		});

		it("should throw error for negative count values", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const invalidResponse: CountByStatusResponse[] = [
				{ count: -1, status: SubscriberStatus.ENABLED },
			];
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				invalidResponse,
			);

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Invalid count value: -1 for status: ENABLED",
			);
		});

		it("should propagate repository errors", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const repositoryError = new Error("Repository connection failed");
			vi.mocked(mockRepository.countByStatus).mockRejectedValue(
				repositoryError,
			);

			// Act & Assert
			await expect(useCase.execute(workspaceId)).rejects.toThrow(
				"Repository connection failed",
			);
		});

		it("should filter out invalid status values", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const responseWithInvalidStatus: CountByStatusResponse[] = [
				{ count: 10, status: SubscriberStatus.ENABLED },
				{ count: 5, status: "INVALID_STATUS" as SubscriberStatus },
			];
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				responseWithInvalidStatus,
			);

			// Act
			const result = await useCase.execute(workspaceId);

			// Assert
			expect(result).toHaveLength(3);
			expect(result).toEqual([
				{ count: 10, status: SubscriberStatus.ENABLED },
				{ count: 0, status: SubscriberStatus.DISABLED },
				{ count: 0, status: SubscriberStatus.BLOCKLISTED },
			]);
		});
	});

	describe("getTotalCount", () => {
		it("should return total count across all statuses", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				mockCountByStatusResponse,
			);

			// Act
			const result = await useCase.getTotalCount(workspaceId);

			// Assert
			expect(result).toBe(17); // 10 + 5 + 2
		});

		it("should return zero for empty counts", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByStatus).mockResolvedValue([]);

			// Act
			const result = await useCase.getTotalCount(workspaceId);

			// Assert
			expect(result).toBe(0);
		});
	});

	describe("getCountForStatus", () => {
		it("should return count for specific status", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				mockCountByStatusResponse,
			);

			// Act
			const result = await useCase.getCountForStatus(
				workspaceId,
				SubscriberStatus.ENABLED,
			);

			// Assert
			expect(result).toBe(10);
		});

		it("should return zero for missing status", async () => {
			// Arrange
			const workspaceId = "123e4567-e89b-12d3-a456-426614174001";
			const partialResponse: CountByStatusResponse[] = [
				{ count: 10, status: SubscriberStatus.ENABLED },
			];
			vi.mocked(mockRepository.countByStatus).mockResolvedValue(
				partialResponse,
			);

			// Act
			const result = await useCase.getCountForStatus(
				workspaceId,
				SubscriberStatus.DISABLED,
			);

			// Assert
			expect(result).toBe(0);
		});
	});
});
