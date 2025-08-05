/**
 * Logout use case interface for dependency injection.
 * This allows the use case to be independent of specific API implementations.
 */
export interface LogoutApiPort {
	logout(): Promise<void>;
}

/**
 * Logout use case containing pure business logic for user logout.
 * This use case is framework-agnostic and contains no infrastructure dependencies.
 */
export class LogoutUseCase {
	constructor(private readonly logoutApi: LogoutApiPort) {}

	/**
	 * Executes the logout use case.
	 *
	 * This use case handles the business logic for logging out a user,
	 * including any cleanup or validation that needs to occur.
	 *
	 * @returns Promise that resolves when logout is complete
	 */
	async execute(): Promise<void> {
		try {
			// Delegate to infrastructure layer for actual logout
			await this.logoutApi.logout();

			// Business logic: Any additional cleanup could go here
			// For example, clearing cached data, analytics events, etc.
		} catch (error) {
			// For logout, we generally want to continue even if the API call fails
			// The infrastructure layer should handle logging the error
			// We don't re-throw because we still want to clear local state
			if (import.meta.env.DEV) {
				console.warn(
					"Logout API call failed, but continuing with local cleanup:",
					error,
				);
			}
		}
	}
}
