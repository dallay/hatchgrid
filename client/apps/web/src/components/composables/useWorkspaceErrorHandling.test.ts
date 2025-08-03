import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Ref, ref } from "vue";
import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
	WorkspaceNotFoundError,
} from "@/workspace/domain/errors";
import type { WorkspaceError } from "@/workspace/store/useWorkspaceStore";
import { useWorkspaceErrorHandling } from "./useWorkspaceErrorHandling";

// Mock vue-sonner
vi.mock("vue-sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
	},
}));

describe("useWorkspaceErrorHandling", () => {
	let mockError: Ref<WorkspaceError | null>;
	let mockOnRetry: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockError = ref<WorkspaceError | null>(null);
		mockOnRetry = vi.fn();
		vi.clearAllMocks();
	});

	describe("error state management", () => {
		it("should detect when there is no error", () => {
			const { hasError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(hasError.value).toBe(false);
		});

		it("should detect when there is an error", () => {
			mockError.value = {
				message: "Test error",
				code: "TEST_ERROR",
				timestamp: new Date(),
			};

			const { hasError, errorMessage, errorCode } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(hasError.value).toBe(true);
			expect(errorMessage.value).toBe("Test error");
			expect(errorCode.value).toBe("TEST_ERROR");
		});

		it("should handle error without code", () => {
			mockError.value = {
				message: "Test error",
				timestamp: new Date(),
			};

			const { errorCode } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(errorCode.value).toBe("UNKNOWN_ERROR");
		});
	});

	describe("error classification", () => {
		it("should identify network errors", () => {
			mockError.value = {
				message: "Network error",
				code: "WORKSPACE_API_ERROR",
				timestamp: new Date(),
			};

			const { isNetworkError, isValidationError, isNotFoundError } =
				useWorkspaceErrorHandling({
					error: mockError,
					onRetry: mockOnRetry,
				});

			expect(isNetworkError.value).toBe(true);
			expect(isValidationError.value).toBe(false);
			expect(isNotFoundError.value).toBe(false);
		});

		it("should identify validation errors", () => {
			mockError.value = {
				message: "Invalid ID",
				code: "INVALID_WORKSPACE_ID",
				timestamp: new Date(),
			};

			const { isNetworkError, isValidationError, isNotFoundError } =
				useWorkspaceErrorHandling({
					error: mockError,
					onRetry: mockOnRetry,
				});

			expect(isNetworkError.value).toBe(false);
			expect(isValidationError.value).toBe(true);
			expect(isNotFoundError.value).toBe(false);
		});

		it("should identify not found errors", () => {
			mockError.value = {
				message: "Workspace not found",
				code: "WORKSPACE_NOT_FOUND",
				timestamp: new Date(),
			};

			const { isNetworkError, isValidationError, isNotFoundError } =
				useWorkspaceErrorHandling({
					error: mockError,
					onRetry: mockOnRetry,
				});

			expect(isNetworkError.value).toBe(false);
			expect(isValidationError.value).toBe(false);
			expect(isNotFoundError.value).toBe(true);
		});
	});

	describe("retry logic", () => {
		it("should allow retry for retryable errors", () => {
			mockError.value = {
				message: "Network error",
				code: "WORKSPACE_API_ERROR",
				timestamp: new Date(),
			};

			const { isRetryable } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(isRetryable.value).toBe(true);
		});

		it("should not allow retry for validation errors", () => {
			mockError.value = {
				message: "Invalid ID",
				code: "INVALID_WORKSPACE_ID",
				timestamp: new Date(),
			};

			const { isRetryable } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(isRetryable.value).toBe(false);
		});

		it("should handle successful retry", async () => {
			const { toast } = await import("vue-sonner");
			mockOnRetry.mockResolvedValue(undefined);

			const { handleRetry } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
				retrySuccessMessage: "Retry successful",
				retrySuccessDescription: "Workspaces have been reloaded.",
			});

			await handleRetry();

			expect(mockOnRetry).toHaveBeenCalledOnce();
			expect(toast.success).toHaveBeenCalledWith(
				"Retry successful",
				expect.objectContaining({
					description: "Workspaces have been reloaded.",
				}),
			);
		});

		it("should handle successful retry with default messages", async () => {
			const { toast } = await import("vue-sonner");
			mockOnRetry.mockResolvedValue(undefined);

			const { handleRetry } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			await handleRetry();

			expect(mockOnRetry).toHaveBeenCalledOnce();
			expect(toast.success).toHaveBeenCalledWith(
				"Operation successful",
				expect.objectContaining({
					description: "The operation has been completed successfully.",
				}),
			);
		});

		it("should handle failed retry", async () => {
			const { toast } = await import("vue-sonner");
			const retryError = new Error("Retry failed");
			mockOnRetry.mockRejectedValue(retryError);

			const { handleRetry } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			await handleRetry();

			expect(mockOnRetry).toHaveBeenCalledOnce();
			expect(toast.error).toHaveBeenCalledWith(
				"Retry failed",
				expect.objectContaining({
					description: expect.any(String),
				}),
			);
		});
	});

	describe("error descriptions", () => {
		it("should provide appropriate description for API errors", () => {
			mockError.value = {
				message: "API error",
				code: "WORKSPACE_API_ERROR",
				timestamp: new Date(),
			};

			const { getErrorDescription } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(getErrorDescription()).toBe(
				"Please check your connection and try again.",
			);
		});

		it("should provide appropriate description for not found errors", () => {
			mockError.value = {
				message: "Not found",
				code: "WORKSPACE_NOT_FOUND",
				timestamp: new Date(),
			};

			const { getErrorDescription } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(getErrorDescription()).toBe(
				"The workspace may have been deleted or you may not have access.",
			);
		});

		it("should provide default description for unknown errors", () => {
			mockError.value = {
				message: "Unknown error",
				code: "UNKNOWN_ERROR",
				timestamp: new Date(),
			};

			const { getErrorDescription } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			expect(getErrorDescription()).toBe(
				"Please try again or contact support if the problem persists.",
			);
		});
	});

	describe("error handling", () => {
		it("should handle WorkspaceApiError", async () => {
			const { toast } = await import("vue-sonner");
			const error = new WorkspaceApiError("test operation", 500);

			const { handleError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			handleError(error);

			expect(toast.error).toHaveBeenCalledWith(
				"Connection Error",
				expect.objectContaining({
					description:
						"Unable to connect to the workspace service. Please check your connection.",
				}),
			);
		});

		it("should handle WorkspaceNotFoundError", async () => {
			const { toast } = await import("vue-sonner");
			const error = new WorkspaceNotFoundError("test-id");

			const { handleError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			handleError(error);

			expect(toast.error).toHaveBeenCalledWith(
				"Workspace Not Found",
				expect.objectContaining({
					description: "The requested workspace could not be found.",
				}),
			);
		});

		it("should handle InvalidWorkspaceIdError", async () => {
			const { toast } = await import("vue-sonner");
			const error = new InvalidWorkspaceIdError("invalid-id");

			const { handleError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			handleError(error);

			expect(toast.error).toHaveBeenCalledWith(
				"Invalid Workspace",
				expect.objectContaining({
					description: "The workspace identifier is not valid.",
				}),
			);
		});

		it("should handle generic Error", async () => {
			const { toast } = await import("vue-sonner");
			const error = new Error("Generic error");

			const { handleError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			handleError(error);

			expect(toast.error).toHaveBeenCalledWith(
				"Generic error",
				expect.objectContaining({
					description: expect.any(String),
				}),
			);
		});

		it("should handle unknown error types", async () => {
			const { toast } = await import("vue-sonner");
			const error = "string error";

			const { handleError } = useWorkspaceErrorHandling({
				error: mockError,
				onRetry: mockOnRetry,
			});

			handleError(error);

			expect(toast.error).toHaveBeenCalledWith(
				"An unexpected error occurred",
				expect.objectContaining({
					description: "Please try again or contact support.",
				}),
			);
		});
	});
});
