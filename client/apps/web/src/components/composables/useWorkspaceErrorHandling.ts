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

// Centralized error codes for consistency and maintainability
const ERROR_CODES = {
	WORKSPACE_API_ERROR: "WORKSPACE_API_ERROR",
	WORKSPACE_NOT_FOUND: "WORKSPACE_NOT_FOUND",
	INVALID_WORKSPACE_ID: "INVALID_WORKSPACE_ID",
	INVALID_UUID_FORMAT: "INVALID_UUID_FORMAT",
	INVALID_RESPONSE_FORMAT: "INVALID_RESPONSE_FORMAT",
	LOAD_ALL_WORKSPACES_ERROR: "LOAD_ALL_WORKSPACES_ERROR",
	SELECT_WORKSPACE_ERROR: "SELECT_WORKSPACE_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Error categories for consistent classification
const VALIDATION_ERROR_CODES = [
	ERROR_CODES.INVALID_WORKSPACE_ID,
	ERROR_CODES.INVALID_UUID_FORMAT,
	ERROR_CODES.INVALID_RESPONSE_FORMAT,
] as const;

const NON_RETRYABLE_ERROR_CODES = [
	ERROR_CODES.INVALID_WORKSPACE_ID,
	ERROR_CODES.INVALID_UUID_FORMAT,
	ERROR_CODES.INVALID_RESPONSE_FORMAT,
] as const;

interface UseWorkspaceErrorHandlingOptions {
	error: Ref<WorkspaceError | null>;
	onRetry?: () => Promise<void> | void;
	onClearError?: () => void;
	retrySuccessMessage?: string;
	retrySuccessDescription?: string;
}

export function useWorkspaceErrorHandling({
	error,
	onRetry,
	onClearError,
	retrySuccessMessage = "Operation successful",
	retrySuccessDescription = "The operation has been completed successfully.",
}: UseWorkspaceErrorHandlingOptions) {
	// Computed properties for error state
	const hasError = computed(() => error.value !== null);

	const errorMessage = computed(() => {
		if (!error.value) return "";
		return error.value.message;
	});

	const errorCode = computed(() => {
		if (!error.value) return "";
		return error.value.code || ERROR_CODES.UNKNOWN_ERROR;
	});

	const isRetryable = computed(() => {
		if (!error.value?.code) return true;

		// Don't allow retry for validation errors
		return !NON_RETRYABLE_ERROR_CODES.includes(
			error.value.code as (typeof NON_RETRYABLE_ERROR_CODES)[number],
		);
	});

	// Error classification helpers
	const isNetworkError = computed(() => {
		return errorCode.value === ERROR_CODES.WORKSPACE_API_ERROR;
	});

	const isValidationError = computed(() => {
		return VALIDATION_ERROR_CODES.includes(
			errorCode.value as (typeof VALIDATION_ERROR_CODES)[number],
		);
	});

	const isNotFoundError = computed(() => {
		return errorCode.value === ERROR_CODES.WORKSPACE_NOT_FOUND;
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
			case ERROR_CODES.WORKSPACE_API_ERROR:
				return "Please check your connection and try again.";
			case ERROR_CODES.WORKSPACE_NOT_FOUND:
				return "The workspace may have been deleted or you may not have access.";
			case ERROR_CODES.INVALID_WORKSPACE_ID:
			case ERROR_CODES.INVALID_UUID_FORMAT:
				return "Please select a valid workspace.";
			case ERROR_CODES.INVALID_RESPONSE_FORMAT:
				return "The server response was invalid. Please try again.";
			case ERROR_CODES.LOAD_ALL_WORKSPACES_ERROR:
				return "Unable to load your workspaces. Please try refreshing.";
			case ERROR_CODES.SELECT_WORKSPACE_ERROR:
				return "Unable to select the workspace. Please try again.";
			default:
				return "Please try again or contact support if the problem persists.";
		}
	};

	// Get user-friendly error titles
	const getErrorTitle = (): string => {
		if (!error.value) return "";

		switch (errorCode.value) {
			case ERROR_CODES.WORKSPACE_API_ERROR:
				return "Connection Error";
			case ERROR_CODES.WORKSPACE_NOT_FOUND:
				return "Workspace Not Found";
			case ERROR_CODES.INVALID_WORKSPACE_ID:
			case ERROR_CODES.INVALID_UUID_FORMAT:
			case ERROR_CODES.INVALID_RESPONSE_FORMAT:
				return "Invalid Workspace";
			case ERROR_CODES.LOAD_ALL_WORKSPACES_ERROR:
				return "Loading Failed";
			case ERROR_CODES.SELECT_WORKSPACE_ERROR:
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
			showSuccessToast(retrySuccessMessage, retrySuccessDescription);
		} catch (err) {
			handleError(err, "retry");
		}
	};

	// Clear error state
	const clearError = () => {
		if (onClearError) {
			onClearError();
		} else {
			console.warn(
				"clearError called but no onClearError callback provided. " +
					"Consider passing an onClearError callback to properly clear the error state.",
			);
		}
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
