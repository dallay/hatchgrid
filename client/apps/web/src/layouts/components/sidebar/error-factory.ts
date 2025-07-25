/**
 * Centralized error factory for sidebar components
 * Provides consistent error handling and recovery strategies
 */

export interface SidebarError {
	code: string;
	message: string;
	recoverable: boolean;
	timestamp: number;
	context?: Record<string, unknown>;
}

export function createNavigationError(
	originalError: Error,
	context?: Record<string, unknown>,
): SidebarError {
	return {
		code: "NAVIGATION_ERROR",
		message: "Failed to load navigation items",
		recoverable: true,
		timestamp: Date.now(),
		context: {
			originalMessage: originalError.message,
			stack: import.meta.env.DEV ? originalError.stack : undefined,
			...context,
		},
	};
}

export function createPermissionError(
	itemTitle: string,
	originalError: unknown,
): SidebarError {
	return {
		code: "PERMISSION_ERROR",
		message: `Access check failed for "${itemTitle}"`,
		recoverable: true,
		timestamp: Date.now(),
		context: {
			itemTitle,
			originalError:
				originalError instanceof Error
					? originalError.message
					: String(originalError),
		},
	};
}

export function createValidationError(
	validationErrors: string[],
	context?: Record<string, unknown>,
): SidebarError {
	return {
		code: "VALIDATION_ERROR",
		message: "Navigation configuration is invalid",
		recoverable: false,
		timestamp: Date.now(),
		context: {
			validationErrors,
			...context,
		},
	};
}

export function createRenderError(
	componentName: string,
	originalError: Error,
): SidebarError {
	return {
		code: "RENDER_ERROR",
		message: `Failed to render ${componentName}`,
		recoverable: true,
		timestamp: Date.now(),
		context: {
			componentName,
			originalMessage: originalError.message,
			stack: import.meta.env.DEV ? originalError.stack : undefined,
		},
	};
}

export function isRecoverable(error: SidebarError): boolean {
	return error.recoverable;
}

export function shouldRetry(
	error: SidebarError,
	retryCount: number,
	maxRetries = 3,
): boolean {
	return isRecoverable(error) && retryCount < maxRetries;
}

export function getDisplayMessage(error: SidebarError): string {
	switch (error.code) {
		case "NAVIGATION_ERROR":
			return "Unable to load navigation. Please try again.";
		case "PERMISSION_ERROR":
			return "Access denied for some navigation items.";
		case "VALIDATION_ERROR":
			return "Navigation configuration error. Please contact support.";
		case "RENDER_ERROR":
			return "Display error occurred. Refreshing may help.";
		default:
			return "An unexpected error occurred.";
	}
}
