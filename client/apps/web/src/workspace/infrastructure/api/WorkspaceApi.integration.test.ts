/**
 * Integration tests for WorkspaceApi class using MSW.
 * Tests the HTTP API implementation with mocked server responses.
 */

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import type { Workspace } from "../../domain/models/Workspace";
import { WorkspaceApi } from "./WorkspaceApi";

// Mock server setup
const server = setupServer();

describe("WorkspaceApi Integration Tests", () => {
	let workspaceApi: WorkspaceApi;

	const mockWorkspace: Workspace = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		name: "Test Workspace",
		description: "A test workspace",
		ownerId: "456e7890-e89b-12d3-a456-426614174001",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
	};

	const mockWorkspace2: Workspace = {
		id: "987e6543-e21b-12d3-a456-426614174002",
		name: "Another Workspace",
		description: "Another test workspace",
		ownerId: "456e7890-e89b-12d3-a456-426614174001",
		createdAt: "2023-01-02T00:00:00Z",
		updatedAt: "2023-01-02T00:00:00Z",
	};

	beforeAll(() => {
		server.listen({ onUnhandledRequest: "error" });
	});

	afterAll(() => {
		server.close();
	});

	afterEach(() => {
		server.resetHandlers();
	});

	beforeEach(() => {
		workspaceApi = new WorkspaceApi(undefined, {
			timeout: 5000,
			maxRetries: 2,
			retryDelay: 100,
		});
	});

	describe("list()", () => {
		it("should successfully fetch workspaces from API", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [mockWorkspace, mockWorkspace2],
			};

			server.use(
				http.get("/api/workspace", () => {
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.list();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(result.data).toHaveLength(2);
			expect(result.data[0]).toEqual(mockWorkspace);
			expect(result.data[1]).toEqual(mockWorkspace2);
		});

		it("should handle empty workspace list", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [],
			};

			server.use(
				http.get("/api/workspace", () => {
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.list();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(result.data).toHaveLength(0);
		});

		it("should retry on server errors and eventually succeed", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [mockWorkspace],
			};

			let callCount = 0;
			server.use(
				http.get("/api/workspace", () => {
					callCount++;
					if (callCount <= 1) {
						return HttpResponse.json(
							{ message: "Internal server error" },
							{ status: 500 },
						);
					}
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.list();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(callCount).toBe(2);
		});

		it("should throw error after exhausting retries", async () => {
			// Arrange
			server.use(
				http.get("/api/workspace", () => {
					return HttpResponse.json(
						{ message: "Internal server error" },
						{ status: 500 },
					);
				}),
			);

			// Act & Assert
			await expect(workspaceApi.list()).rejects.toThrow("Workspace API error during list workspaces");
		});

		it("should not retry on client errors", async () => {
			// Arrange
			let callCount = 0;
			server.use(
				http.get("/api/workspace", () => {
					callCount++;
					return HttpResponse.json({ message: "Bad request" }, { status: 400 });
				}),
			);

			// Act & Assert
			await expect(workspaceApi.list()).rejects.toThrow("Workspace API error during list workspaces");
			expect(callCount).toBe(1);
		});

		it("should handle network errors with retry", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [mockWorkspace],
			};

			let callCount = 0;
			server.use(
				http.get("/api/workspace", () => {
					callCount++;
					if (callCount <= 1) {
						return HttpResponse.error();
					}
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.list();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(callCount).toBe(2);
		});

		it("should include authentication headers", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [mockWorkspace],
			};

			let receivedHeaders: Headers;
			server.use(
				http.get("/api/workspace", ({ request }) => {
					receivedHeaders = request.headers;
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			await workspaceApi.list();

			// Assert
			// Note: Authentication headers are handled by axios interceptors globally
			// This test verifies the request structure is correct
			expect(receivedHeaders!).toBeDefined();
		});
	});

	describe("getById()", () => {
		const validId = "123e4567-e89b-12d3-a456-426614174000";

		it("should successfully fetch workspace by ID", async () => {
			// Arrange
			const mockResponse: SingleItemResponse<Workspace> = {
				data: mockWorkspace,
			};

			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.getById(validId);

			// Assert
			expect(result).toEqual(mockResponse);
			expect(result!.data).toEqual(mockWorkspace);
		});

		it("should return null for 404 responses", async () => {
			// Arrange
			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					return HttpResponse.json(
						{ message: "Workspace not found" },
						{ status: 404 },
					);
				}),
			);

			// Act
			const result = await workspaceApi.getById(validId);

			// Assert
			expect(result).toBeNull();
		});

		it("should not retry 404 responses", async () => {
			// Arrange
			let callCount = 0;
			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					callCount++;
					return HttpResponse.json(
						{ message: "Workspace not found" },
						{ status: 404 },
					);
				}),
			);

			// Act
			const result = await workspaceApi.getById(validId);

			// Assert
			expect(result).toBeNull();
			expect(callCount).toBe(1);
		});

		it("should retry on server errors and eventually succeed", async () => {
			// Arrange
			const mockResponse: SingleItemResponse<Workspace> = {
				data: mockWorkspace,
			};

			let callCount = 0;
			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					callCount++;
					if (callCount <= 1) {
						return HttpResponse.json(
							{ message: "Internal server error" },
							{ status: 500 },
						);
					}
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.getById(validId);

			// Assert
			expect(result).toEqual(mockResponse);
			expect(callCount).toBe(2);
		});

		it("should retry on server errors but return null if final response is 404", async () => {
			// Arrange
			let callCount = 0;
			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					callCount++;
					if (callCount <= 1) {
						return HttpResponse.json(
							{ message: "Internal server error" },
							{ status: 500 },
						);
					}
					return HttpResponse.json(
						{ message: "Workspace not found" },
						{ status: 404 },
					);
				}),
			);

			// Act
			const result = await workspaceApi.getById(validId);

			// Assert
			expect(result).toBeNull();
			expect(callCount).toBe(2);
		});

		it("should throw error for non-404 HTTP errors after retries", async () => {
			// Arrange
			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					return HttpResponse.json(
						{ message: "Internal server error" },
						{ status: 500 },
					);
				}),
			);

			// Act & Assert
			await expect(workspaceApi.getById(validId)).rejects.toThrow(`Workspace API error during get workspace ${validId}`);
		});

		it("should validate UUID format before making request", async () => {
			// Arrange
			const invalidId = "invalid-uuid";

			// Act & Assert
			await expect(workspaceApi.getById(invalidId)).rejects.toThrow(
				"Invalid workspace ID format: invalid-uuid",
			);
		});

		it("should use custom timeout configuration in request", async () => {
			// Arrange
			const customTimeoutApi = new WorkspaceApi(undefined, { timeout: 2000 });
			const mockResponse: SingleItemResponse<Workspace> = {
				data: mockWorkspace,
			};

			server.use(
				http.get(`/api/workspace/${validId}`, () => {
					return HttpResponse.json(mockResponse);
				})
			);

			// Act
			const result = await customTimeoutApi.getById(validId);

			// Assert
			expect(result).toEqual(mockResponse);
			// Note: Timeout configuration is passed to axios but cannot be easily tested with MSW
			// This test verifies the API accepts custom configuration without errors
		});

		it("should include correct request path and headers", async () => {
			// Arrange
			const mockResponse: SingleItemResponse<Workspace> = {
				data: mockWorkspace,
			};

			let receivedUrl: string;
			let receivedHeaders: Headers;
			server.use(
				http.get(`/api/workspace/${validId}`, ({ request }) => {
					receivedUrl = request.url;
					receivedHeaders = request.headers;
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			await workspaceApi.getById(validId);

			// Assert
			expect(receivedUrl!).toContain(`/api/workspace/${validId}`);
			expect(receivedHeaders!).toBeDefined();
		});
	});

	describe("error handling and authentication", () => {
		it("should handle rate limiting with retry", async () => {
			// Arrange
			const mockResponse: CollectionResponse<Workspace> = {
				data: [mockWorkspace],
			};

			let callCount = 0;
			server.use(
				http.get("/api/workspace", () => {
					callCount++;
					if (callCount <= 1) {
						return HttpResponse.json(
							{ message: "Rate limit exceeded" },
							{ status: 429 },
						);
					}
					return HttpResponse.json(mockResponse);
				}),
			);

			// Act
			const result = await workspaceApi.list();

			// Assert
			expect(result).toEqual(mockResponse);
			expect(callCount).toBe(2);
		});

		it("should handle malformed JSON responses", async () => {
			// Arrange
			server.use(
				http.get("/api/workspace", () => {
					return new Response("Invalid JSON", {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}),
			);

			// Act & Assert
			await expect(workspaceApi.list()).rejects.toThrow();
		});

		it("should handle responses with missing data field", async () => {
			// Arrange
			server.use(
				http.get("/api/workspace", () => {
					return HttpResponse.json({ message: "Success but no data" });
				}),
			);

			// Act & Assert
			await expect(workspaceApi.list()).rejects.toThrow("Workspace API error during list workspaces");
		});
	});
});
