/**
 * Unit tests for WorkspaceApi implementation
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
} from "../../domain/errors/WorkspaceErrors";
import type { Workspace } from "../../domain/models/Workspace";
import type { IHttpClient } from "../http/HttpClient";
import { WorkspaceApi } from "./WorkspaceApi";

// Mock HTTP client
const createMockHttpClient = (): IHttpClient => ({
	get: vi.fn(),
});

// Sample workspace data
const sampleWorkspace: Workspace = {
	id: "123e4567-e89b-12d3-a456-426614174000",
	name: "Test Workspace",
	description: "A test workspace",
	ownerId: "123e4567-e89b-12d3-a456-426614174001",
	isDefault: false,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

const sampleCollectionResponse: CollectionResponse<Workspace> = {
	data: [sampleWorkspace],
};

const sampleSingleResponse: SingleItemResponse<Workspace> = {
	data: sampleWorkspace,
};

describe("WorkspaceApi", () => {
	let mockHttpClient: IHttpClient;
	let workspaceApi: WorkspaceApi;

	beforeEach(() => {
		mockHttpClient = createMockHttpClient();
		workspaceApi = new WorkspaceApi(mockHttpClient);
	});

	describe("list()", () => {
		it("should return workspaces when API call succeeds", async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValue(sampleCollectionResponse);

			const result = await workspaceApi.list();

			expect(result).toEqual(sampleCollectionResponse);
			expect(mockHttpClient.get).toHaveBeenCalledWith("/api/workspace");
		});

		it("should throw WorkspaceApiError when HTTP client throws", async () => {
			const error = new Error("Network error");
			vi.mocked(mockHttpClient.get).mockRejectedValue(error);

			await expect(workspaceApi.list()).rejects.toThrow(WorkspaceApiError);
		});

		it("should throw WorkspaceApiError when response format is invalid", async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValue({ data: "invalid" });

			await expect(workspaceApi.list()).rejects.toThrow(WorkspaceApiError);
		});

		it("should throw WorkspaceApiError when workspace data is invalid", async () => {
			const invalidResponse = {
				data: [{ id: "invalid-workspace" }], // Missing required fields
			};
			vi.mocked(mockHttpClient.get).mockResolvedValue(invalidResponse);

			await expect(workspaceApi.list()).rejects.toThrow(WorkspaceApiError);
		});
	});

	describe("getById()", () => {
		const validId = "123e4567-e89b-12d3-a456-426614174000";

		it("should return workspace when API call succeeds", async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValue(sampleSingleResponse);

			const result = await workspaceApi.getById(validId);

			expect(result).toEqual(sampleSingleResponse);
			expect(mockHttpClient.get).toHaveBeenCalledWith(
				`/api/workspace/${validId}`,
			);
		});

		it("should throw InvalidWorkspaceIdError for invalid UUID", async () => {
			const invalidId = "invalid-uuid";

			await expect(workspaceApi.getById(invalidId)).rejects.toThrow(
				InvalidWorkspaceIdError,
			);
			expect(mockHttpClient.get).not.toHaveBeenCalled();
		});

		it("should return null for 404 errors", async () => {
			const httpError = new Error(
				"HTTP GET /api/workspace/123e4567-e89b-12d3-a456-426614174000 (404): Workspace not found",
			);
			vi.mocked(mockHttpClient.get).mockRejectedValue(httpError);

			const result = await workspaceApi.getById(validId);

			expect(result).toBeNull();
		});

		it("should throw WorkspaceApiError for other HTTP errors", async () => {
			const error = new Error("Server error");
			vi.mocked(mockHttpClient.get).mockRejectedValue(error);

			await expect(workspaceApi.getById(validId)).rejects.toThrow(
				WorkspaceApiError,
			);
		});

		it("should throw WorkspaceApiError when response format is invalid", async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValue({ data: null });

			await expect(workspaceApi.getById(validId)).rejects.toThrow(
				WorkspaceApiError,
			);
		});

		it("should throw WorkspaceApiError when workspace data is invalid", async () => {
			const invalidResponse = {
				data: { id: "invalid-workspace" }, // Missing required fields
			};
			vi.mocked(mockHttpClient.get).mockResolvedValue(invalidResponse);

			await expect(workspaceApi.getById(validId)).rejects.toThrow(
				WorkspaceApiError,
			);
		});
	});
});
