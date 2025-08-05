/**
 * Authentication module public API
 * Provides clean interface for using the authentication feature
 */

// Application layer exports (use cases)
export {
	type LoginApiPort,
	LoginUseCase,
	type LogoutApiPort,
	LogoutUseCase,
	type RegisterApiPort,
	RegisterUseCase,
	type RegistrationData,
} from "./application";
// Domain layer exports
export type { Account } from "./domain";
export {
	AccessDeniedError,
	AccountNotActivatedError,
	AuthenticationError,
	Authority,
	InvalidCredentialsError,
	PasswordResetError,
	RegistrationError,
	SessionExpiredError,
} from "./domain";

// Infrastructure layer exports (store, API, routing, views)
export * from "./infrastructure";
