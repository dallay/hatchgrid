import type { AxiosResponse } from "axios";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	SubscriberApi,
	SubscriberApiError,
	SubscriberValidationError,
} from "./SubscriberApi";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
	get: ReturnType<typeof vi.fn>;
};

const mockWorkspaceId = "b3e1a2c4-5d6f-4e7a-8b9c-0d1e2f3a4b5c";
const mockSubscribersApiResponse = {
	data: [
		{
			id: "ecf5cb75-154e-4b80-bbff-8da39632c93b",
			email: "test@example.com",
			name: "Test User",
			status: "ENABLED",
			attributes: { foo: "bar" },
			workspaceId: mockWorkspaceId,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		},
	],
	page: 1,
	size: 10,
	total: 1,
};

const mockCountByStatusApiResponse = {
	data: [
		{ status: "ENABLED", count: 5 },
		{ status: "DISABLED", count: 2 },
	],
};

const mockCountByTagsApiResponse = {
	data: [
		{ tag: "feature", count: 3 },
		{ tag: "bug", count: 2 },
	],
};

describe("SubscriberApi", () => {
	let api: SubscriberApi;

	beforeEach(() => {
		api = new SubscriberApi();
		vi.clearAllMocks();
	});

	describe("fetchAll", () => {
		it("should fetch and transform subscribers", async () => {
			mockedAxios.get = vi.fn().mockResolvedValue({
				data: mockSubscribersApiResponse,
			} as AxiosResponse);

			const result = await api.fetchAll(mockWorkspaceId);

			expect(mockedAxios.get).toHaveBeenCalledWith(
				"/api/workspace/b3e1a2c4-5d6f-4e7a-8b9c-0d1e2f3a4b5c/newsletter/subscriber",
				{ withCredentials: true },
			);
			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				id: "ecf5cb75-154e-4b80-bbff-8da39632c93b",
				email: "test@example.com",
				name: "Test User",
				status: "ENABLED",
				attributes: { foo: "bar" },
				workspaceId: mockWorkspaceId,
			});
			expect(result[0].createdAt).toBeInstanceOf(Date);
			expect(result[0].updatedAt).toBeInstanceOf(Date);
		});

		it("should throw validation error for empty workspaceId", async () => {
			await expect(api.fetchAll("")).rejects.toThrow(SubscriberValidationError);
		});

		it("should handle API errors", async () => {
			mockedAxios.get = vi.fn().mockRejectedValue({
				response: { status: 404, data: { message: "Not found" } },
				message: "Not found",
				isAxiosError: true,
			});
			await expect(api.fetchAll(mockWorkspaceId)).rejects.toThrow(
				SubscriberApiError,
			);
		});
	});

	describe("countByStatus", () => {
		it("should fetch and transform count by status", async () => {
			mockedAxios.get = vi.fn().mockResolvedValue({
				data: mockCountByStatusApiResponse,
			} as AxiosResponse);

			const result = await api.countByStatus(mockWorkspaceId);

			expect(mockedAxios.get).toHaveBeenCalledWith(
				"/api/workspace/b3e1a2c4-5d6f-4e7a-8b9c-0d1e2f3a4b5c/newsletter/subscriber/count-by-status",
				{ withCredentials: true },
			);
			expect(result).toEqual([
				{ status: "ENABLED", count: 5 },
				{ status: "DISABLED", count: 2 },
			]);
		});

		it("should throw validation error for empty workspaceId", async () => {
			await expect(api.countByStatus("")).rejects.toThrow(
				SubscriberValidationError,
			);
		});
	});

	describe("countByTags", () => {
		it("should fetch and transform count by tags", async () => {
			mockedAxios.get = vi.fn().mockResolvedValue({
				data: mockCountByTagsApiResponse,
			} as AxiosResponse);

			const result = await api.countByTags(mockWorkspaceId);

			expect(mockedAxios.get).toHaveBeenCalledWith(
				"/api/workspace/b3e1a2c4-5d6f-4e7a-8b9c-0d1e2f3a4b5c/newsletter/subscriber/count-by-tags",
				{ withCredentials: true },
			);
			expect(result).toEqual([
				{ tag: "feature", count: 3 },
				{ tag: "bug", count: 2 },
			]);
		});

		it("should throw validation error for empty workspaceId", async () => {
			await expect(api.countByTags("")).rejects.toThrow(
				SubscriberValidationError,
			);
		});
	});

	describe("Error handling", () => {
		it("should throw SubscriberApiError for 400 errors", async () => {
			mockedAxios.get = vi.fn().mockRejectedValue({
				response: {
					status: 400,
					data: { message: "Bad request", errors: { foo: "bar" } },
				},
				message: "Bad request",
				isAxiosError: true,
			});
			await expect(api.fetchAll(mockWorkspaceId)).rejects.toThrow(
				SubscriberApiError,
			);
		});

		it("should throw SubscriberApiError for unknown errors", async () => {
			mockedAxios.get = vi.fn().mockRejectedValue(new Error("Unknown error"));
			await expect(api.fetchAll(mockWorkspaceId)).rejects.toThrow(
				SubscriberApiError,
			);
		});
	});
});
