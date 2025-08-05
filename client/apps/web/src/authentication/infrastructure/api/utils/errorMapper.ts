import { isAxiosError } from "axios";
import {
	AccessDeniedError,
	AuthenticationError,
	InvalidCredentialsError,
	SessionExpiredError,
} from "../../../domain/errors";

/**
 * Maps authentication-related HTTP errors to domain errors.
 */
export function mapAuthenticationError(
	error: unknown,
	context: string,
): AuthenticationError {
	if (isAxiosError(error)) {
		const status = error.response?.status;
		const message = error.response?.data?.message;

		switch (status) {
			case 401:
				return context === "login"
					? new InvalidCredentialsError()
					: new SessionExpiredError();
			case 403:
				return new AccessDeniedError({ resource: context });
			default:
				return new AuthenticationError(
					message || `${context} failed`,
					`${context.toUpperCase()}_FAILED`,
				);
		}
	}

	return new AuthenticationError(
		`Unknown error during ${context}`,
		"UNKNOWN_ERROR",
	);
}

/**
 * Maps session-related HTTP errors.
 */
export function mapSessionError(error: unknown): AuthenticationError | null {
	if (isAxiosError(error)) {
		const status = error.response?.status;
		if (status === 401 || status === 403) {
			return new SessionExpiredError();
		}
	}
	return null;
}
