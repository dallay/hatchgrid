import { AuthenticationError } from "../domain/errors";
import { AuthenticationApi } from "../infrastructure/api";

/**
 * Activate user account use case
 *
 * @param activationKey - The activation key from the email
 * @throws {AuthenticationError} When activation fails
 */
export async function activateAccount(activationKey: string): Promise<void> {
	if (!activationKey.trim()) {
		throw new AuthenticationError(
			"Activation key cannot be empty",
			"INVALID_KEY",
		);
	}

	try {
		const authApi = new AuthenticationApi();
		await authApi.activateAccount(activationKey);
	} catch (error) {
		// Re-throw as domain error for consistent error handling
		if (error instanceof AuthenticationError) {
			throw error;
		}

		// Handle API errors and convert to domain errors
		const apiError = error as {
			response?: { status?: number; data?: { message?: string } };
		};

		if (apiError.response?.status === 400) {
			throw new AuthenticationError(
				apiError.response.data?.message || "Invalid activation key",
				"INVALID_KEY",
			);
		}

		if (apiError.response?.status === 404) {
			throw new AuthenticationError(
				"Activation key not found or already used",
				"KEY_NOT_FOUND",
			);
		}

		throw new AuthenticationError(
			"Account activation failed. Please try again or contact support.",
			"ACTIVATION_FAILED",
		);
	}
}
