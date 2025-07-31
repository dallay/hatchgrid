/**
 * Composable for handling workspace-related errors and user feedback
 * Provides consistent error handling, toast notifications, and retry logic
 */

import { computed, type Ref } from "vue";
import { toast } from "vue-sonner";
import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
	WorkspaceNotFoundError,
} from "@/workspace/domain/errors";
import type { WorkspaceError } from "@/workspace/store/useWorkspaceStore";

interface UseWorkspaceErrorHandlingOptions {
	error: Ref<WorkspaceError | null>;
	onRetry?: () => Promise<void> | void;
}

export function useWorkspaceErrorHandling({
	error,
	onRetry,
}: UseWorkspaceErrorHandlingOptions) {
	// Computed properties for error state
	const hasError = computed(() => error.value !== null);

	const errorMessage = computed(() => {
		if (!error.value) return "";
		return error.value.message;
	});

	const errorCode = computed(() => {
		if (!error.value) return "";
		return error.value.code || "UNKNOWN_ERROR";
	});

	const isRetryable = computed(() => {
		if (!error.value?.code) return true;

		// Don't allow retry for validation errors
		const nonRetryableCodes = ["INVALID_WORKSPACE_ID", "INVALID_UUID_FORMAT"];

		return !nonRetryableCodes.includes(error.value.code);
	});

	// Error classification helpers
	const isNetworkError = computed(() => {
		return errorCode.value === "WORKSPACE_API_ERROR";
	});

	const isValidationError = computed(() => {
		const validationCodes = [
			"INVALID_WORKSPACE_ID",
			"INVALID_UUID_FORMAT",
			"INVALID_RESPONSE_FORMAT",
		];
		return validationCodes.includes(errorCode.value);
	});

	const isNotFoundError = computed(() => {
		return errorCode.value === "WORKSPACE_NOT_FOUND";
	});

	// Toast notification helpers
	const showErrorToast = (message?: string, description?: string) => {
		toast.error(message || errorMessage.value, {
			description: description || getErrorDescription(),
			duration: 5000,
		});
	};

	const showSuccessToast = (message: string, description?: string) => {
		toast.success(message, {
			description,
			duration: 3000,
		});
	};

	const showWarningToast = (message: string, description?: string) => {
		toast.warning(message, {
			description,
			duration: 4000,
		});
	};

	// Get user-friendly error descriptions
	const getErrorDescription = (): string => {
		if (!error.value) return "";

		switch (errorCode.value) {
			case "WORKSPACE_API_ERROR":
				return "Please check your connection and try again.";
			case "WORKSPACE_NOT_FOUND":
				return "The workspace may have been deleted or you may not have access.";
			case "INVALID_WORKSPACE_ID":
			case "INVALID_UUID_FORMAT":
				return "Please select a valid workspace.";
			case "LOAD_ALL_WORKSPACES_ERROR":
				return "Unable to load your workspaces. Please try refreshing.";
			case "SELECT_WORKSPACE_ERROR":
				return "Unable to select the workspace. Please try again.";
			default:
				return "Please try again or contact support if the problem persists.";
		}
	};

	// Get user-friendly error titles
	const getErrorTitle = (): string => {
		if (!error.value) return "";

		switch (errorCode.value) {
			case "WORKSPACE_API_ERROR":
				return "Connection Error";
			case "WORKSPACE_NOT_FOUND":
				return "Workspace Not Found";
			case "INVALID_WORKSPACE_ID":
			case "INVALID_UUID_FORMAT":
				return "Invalid Workspace";
			case "LOAD_ALL_WORKSPACES_ERROR":
				return "Loading Failed";
			case "SELECT_WORKSPACE_ERROR":
				return "Selection Failed";
			default:
				return "Workspace Error";
		}
	};

	// Handle different types of errors with appropriate user feedback
	const handleError = (err: unknown, context?: string) => {
		console.error(`Workspace error${context ? ` in ${context}` : ""}:`, err);

		let message = "An unexpected error occurred";
		let description = "Please try again or contact support.";

		if (err instanceof WorkspaceApiError) {
			message = "Connection Error";
			description =
				"Unable to connect to the workspace service. Please check your connection.";
		} else if (err instanceof WorkspaceNotFoundError) {
			message = "Workspace Not Found";
			description = "The requested workspace could not be found.";
		} else if (err instanceof InvalidWorkspaceIdError) {
			message = "Invalid Workspace";
			description = "The workspace identifier is not valid.";
		} else if (err instanceof Error) {
			message = err.message;
		}

		showErrorToast(message, description);
	};

	// Retry logic with loading state and error handling
	const handleRetry = async () => {
		if (!onRetry || !isRetryable.value) return;

		try {
			await onRetry();
			showSuccessToast("Retry successful", "Workspaces have been reloaded.");
		} catch (err) {
			handleError(err, "retry");
		}
	};

	// Clear error state
	const clearError = () => {
		// This should be handled by the store, but we can provide a helper
		console.log("Error cleared");
	};

	return {
		// State
		hasError,
		errorMessage,
		errorCode,
		isRetryable,

		// Error classification
		isNetworkError,
		isValidationError,
		isNotFoundError,

		// User-friendly messages
		getErrorTitle,
		getErrorDescription,

		// Actions
		handleError,
		handleRetry,
		clearError,

		// Toast helpers
		showErrorToast,
		showSuccessToast,
		showWarningToast,
	};
}
