import { describe, expect, it } from "vitest";
import {
	InvalidResponseFormatError,
	InvalidWorkspaceIdError,
	WorkspaceApiError,
	WorkspaceError,
	WorkspaceNotFoundError,
} from "./WorkspaceErrors.ts";

describe("WorkspaceErrors", () => {
	describe("WorkspaceError", () => {
		// Create a concrete implementation for testing the abstract base class
		class TestWorkspaceError extends WorkspaceError {
			readonly code = "TEST_ERROR";
		}

		it("should create error with message", () => {
			const error = new TestWorkspaceError("Test error message");

			expect(error.message).toBe("Test error message");
			expect(error.name).toBe("TestWorkspaceError");
			expect(error.code).toBe("TEST_ERROR");
			expect(error.cause).toBeUndefined();
		});

		it("should create error with message and cause", () => {
			const cause = new Error("Original error");
			const error = new TestWorkspaceError("Test error message", cause);

			expect(error.message).toBe("Test error message");
			expect(error.cause).toBe(cause);
		});

		it("should be instance of Error", () => {
			const error = new TestWorkspaceError("Test error");
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(WorkspaceError);
		});
	});

	describe("WorkspaceNotFoundError", () => {
		it("should create error with workspace ID", () => {
			const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
			const error = new WorkspaceNotFoundError(workspaceId);

			expect(error.message).toBe(`Workspace with ID ${workspaceId} not found`);
			expect(error.code).toBe("WORKSPACE_NOT_FOUND");
			expect(error.name).toBe("WorkspaceNotFoundError");
			expect(error.cause).toBeUndefined();
		});

		it("should create error with workspace ID and cause", () => {
			const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
			const cause = new Error("Database error");
			const error = new WorkspaceNotFoundError(workspaceId, cause);

			expect(error.message).toBe(`Workspace with ID ${workspaceId} not found`);
			expect(error.code).toBe("WORKSPACE_NOT_FOUND");
			expect(error.cause).toBe(cause);
		});

		it("should be instance of WorkspaceError", () => {
			const error = new WorkspaceNotFoundError("test-id");
			expect(error).toBeInstanceOf(WorkspaceError);
			expect(error).toBeInstanceOf(WorkspaceNotFoundError);
		});
	});

	describe("InvalidWorkspaceIdError", () => {
		it("should create error with workspace ID", () => {
			const workspaceId = "invalid-id";
			const error = new InvalidWorkspaceIdError(workspaceId);

			expect(error.message).toBe(`Invalid workspace ID format: ${workspaceId}`);
			expect(error.code).toBe("INVALID_WORKSPACE_ID");
			expect(error.name).toBe("InvalidWorkspaceIdError");
			expect(error.cause).toBeUndefined();
		});

		it("should create error with workspace ID and cause", () => {
			const workspaceId = "invalid-id";
			const cause = new Error("Validation error");
			const error = new InvalidWorkspaceIdError(workspaceId, cause);

			expect(error.message).toBe(`Invalid workspace ID format: ${workspaceId}`);
			expect(error.code).toBe("INVALID_WORKSPACE_ID");
			expect(error.cause).toBe(cause);
		});

		it("should be instance of WorkspaceError", () => {
			const error = new InvalidWorkspaceIdError("invalid-id");
			expect(error).toBeInstanceOf(WorkspaceError);
			expect(error).toBeInstanceOf(InvalidWorkspaceIdError);
		});
	});

	describe("InvalidResponseFormatError", () => {
		it("should create error with expected format", () => {
			const expectedFormat = "CollectionResponse<Workspace>";
			const error = new InvalidResponseFormatError(expectedFormat);

			expect(error.message).toBe(`Invalid response format: expected ${expectedFormat}`);
			expect(error.code).toBe("INVALID_RESPONSE_FORMAT");
			expect(error.name).toBe("InvalidResponseFormatError");
			expect(error.cause).toBeUndefined();
		});

		it("should create error with expected format and cause", () => {
			const expectedFormat = "SingleItemResponse<Workspace>";
			const cause = new Error("Parse error");
			const error = new InvalidResponseFormatError(expectedFormat, cause);

			expect(error.message).toBe(`Invalid response format: expected ${expectedFormat}`);
			expect(error.code).toBe("INVALID_RESPONSE_FORMAT");
			expect(error.cause).toBe(cause);
		});

		it("should be instance of WorkspaceError", () => {
			const error = new InvalidResponseFormatError("test-format");
			expect(error).toBeInstanceOf(WorkspaceError);
			expect(error).toBeInstanceOf(InvalidResponseFormatError);
		});
	});

	describe("WorkspaceApiError", () => {
		it("should create error with operation", () => {
			const operation = "list workspaces";
			const error = new WorkspaceApiError(operation);

			expect(error.message).toBe(`Workspace API error during ${operation}`);
			expect(error.code).toBe("WORKSPACE_API_ERROR");
			expect(error.name).toBe("WorkspaceApiError");
			expect(error.statusCode).toBeUndefined();
			expect(error.cause).toBeUndefined();
		});

		it("should create error with operation and status code", () => {
			const operation = "get workspace";
			const statusCode = 404;
			const error = new WorkspaceApiError(operation, statusCode);

			expect(error.message).toBe(`Workspace API error during ${operation}`);
			expect(error.code).toBe("WORKSPACE_API_ERROR");
			expect(error.statusCode).toBe(statusCode);
			expect(error.cause).toBeUndefined();
		});

		it("should create error with operation, status code, and cause", () => {
			const operation = "create workspace";
			const statusCode = 500;
			const cause = new Error("Network error");
			const error = new WorkspaceApiError(operation, statusCode, cause);

			expect(error.message).toBe(`Workspace API error during ${operation}`);
			expect(error.code).toBe("WORKSPACE_API_ERROR");
			expect(error.statusCode).toBe(statusCode);
			expect(error.cause).toBe(cause);
		});

		it("should be instance of WorkspaceError", () => {
			const error = new WorkspaceApiError("test operation");
			expect(error).toBeInstanceOf(WorkspaceError);
			expect(error).toBeInstanceOf(WorkspaceApiError);
		});
	});

	describe("Error inheritance and polymorphism", () => {
		it("should allow catching all workspace errors with base class", () => {
			const errors = [
				new WorkspaceNotFoundError("test-id"),
				new InvalidWorkspaceIdError("invalid-id"),
				new InvalidResponseFormatError("test-format"),
				new WorkspaceApiError("test-operation"),
			];

			for (const error of errors) {
				expect(error).toBeInstanceOf(WorkspaceError);
				expect(error).toBeInstanceOf(Error);
				expect(typeof error.code).toBe("string");
				expect(error.code.length).toBeGreaterThan(0);
			}
		});

		it("should have unique error codes", () => {
			const errors = [
				new WorkspaceNotFoundError("test-id"),
				new InvalidWorkspaceIdError("invalid-id"),
				new InvalidResponseFormatError("test-format"),
				new WorkspaceApiError("test-operation"),
			];

			const codes = errors.map(error => error.code);
			const uniqueCodes = new Set(codes);

			expect(uniqueCodes.size).toBe(codes.length);
		});
	});
});
