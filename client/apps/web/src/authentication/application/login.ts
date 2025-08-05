import { AuthenticationError } from "@/authentication/domain/errors";
import type { Account } from "@/authentication/domain/models";

/**
 * Login use case interface for dependency injection.
 * This allows the use case to be independent of specific API implementations.
 */
export interface LoginApiPort {
	login(username: string, password: string): Promise<Account>;
}

/**
 * Login use case containing pure business logic for user authentication.
 * This use case is framework-agnostic and contains no infrastructure dependencies.
 */
export class LoginUseCase {
	constructor(private readonly loginApi: LoginApiPort) {}

	/**
	 * Executes the login use case.
	 *
	 * @param username - The username to authenticate
	 * @param password - The password to authenticate
	 * @returns Promise resolving to the authenticated Account
	 * @throws {InvalidCredentialsError} When credentials are invalid
	 * @throws {AuthenticationError} For other authentication failures
	 */
	async execute(username: string, password: string): Promise<Account> {
		// Validate input
		if (!username?.trim()) {
			throw new AuthenticationError("Username is required", "MISSING_USERNAME");
		}

		if (!password?.trim()) {
			throw new AuthenticationError("Password is required", "MISSING_PASSWORD");
		}

		try {
			// Delegate to infrastructure layer for actual authentication
			const account = await this.loginApi.login(username.trim(), password);

			// Business logic: Ensure account is activated
			if (!account.activated) {
				throw new AuthenticationError(
					"Account is not activated. Please check your email for activation instructions.",
					"ACCOUNT_NOT_ACTIVATED",
				);
			}

			return account;
		} catch (error) {
			if (error instanceof AuthenticationError) {
				throw error;
			}

			// Convert unknown errors to domain errors
			throw new AuthenticationError(
				"An unexpected error occurred during login",
				"LOGIN_UNEXPECTED_ERROR",
			);
		}
	}
}
