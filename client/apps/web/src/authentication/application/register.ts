import { AuthenticationError } from "@/authentication/domain/errors";

/**
 * Registration data interface for the register use case.
 */
export interface RegistrationData {
	email: string;
	firstname: string;
	lastname: string;
	password: string;
}

/**
 * Registration use case interface for dependency injection.
 * This allows the use case to be independent of specific API implementations.
 */
export interface RegisterApiPort {
	register(registrationData: RegistrationData): Promise<void>;
}

/**
 * Registration use case containing pure business logic for user registration.
 * This use case is framework-agnostic and contains no infrastructure dependencies.
 */
export class RegisterUseCase {
	constructor(private readonly registerApi: RegisterApiPort) {}

	/**
	 * Executes the registration use case.
	 *
	 * @param registrationData - The user registration information
	 * @returns Promise that resolves when registration is complete
	 * @throws {AuthenticationError} For validation or registration failures
	 */
	async execute(registrationData: RegistrationData): Promise<void> {
		// Validate input data
		this.validateRegistrationData(registrationData);

		try {
			// Delegate to infrastructure layer for actual registration
			await this.registerApi.register(registrationData);

			// Business logic: Any post-registration logic could go here
			// For example, analytics events, welcome emails, etc.
		} catch (error) {
			if (error instanceof AuthenticationError) {
				throw error;
			}

			// Convert unknown errors to domain errors
			throw new AuthenticationError(
				"An unexpected error occurred during registration",
				"REGISTRATION_UNEXPECTED_ERROR",
			);
		}
	}

	/**
	 * Validates registration data according to business rules.
	 *
	 * @param data - The registration data to validate
	 * @throws {AuthenticationError} For validation failures
	 */
	private validateRegistrationData(data: RegistrationData): void {
		const validationErrors: string[] = [];

		// Required field validation
		if (!data.email?.trim()) {
			validationErrors.push("Email is required");
		}
		if (!data.firstname?.trim()) {
			validationErrors.push("First name is required");
		}
		if (!data.lastname?.trim()) {
			validationErrors.push("Last name is required");
		}
		if (!data.password?.trim()) {
			validationErrors.push("Password is required");
		}

		// If required fields are missing, throw early
		if (validationErrors.length > 0) {
			throw new AuthenticationError(
				validationErrors.join(", "),
				"MISSING_REQUIRED_FIELDS",
			);
		}

		// Business rule validations
		const email = data.email.trim();
		const firstname = data.firstname.trim();
		const lastname = data.lastname.trim();
		const password = data.password;

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			validationErrors.push("Invalid email format");
		}

		// Password strength validation
		if (password.length < 8) {
			validationErrors.push("Password must be at least 8 characters long");
		}

		// Enhanced password validation
		if (!/(?=.*[a-z])/.test(password)) {
			validationErrors.push(
				"Password must contain at least one lowercase letter",
			);
		}
		if (!/(?=.*[A-Z])/.test(password)) {
			validationErrors.push(
				"Password must contain at least one uppercase letter",
			);
		}
		if (!/(?=.*\d)/.test(password)) {
			validationErrors.push("Password must contain at least one number");
		}

		// Name length validation
		if (firstname.length < 2) {
			validationErrors.push("First name must be at least 2 characters long");
		}
		if (lastname.length < 2) {
			validationErrors.push("Last name must be at least 2 characters long");
		}

		// Name format validation (no numbers or special characters)
		const nameRegex = /^[a-zA-Z\s'-]+$/;
		if (!nameRegex.test(firstname)) {
			validationErrors.push(
				"First name can only contain letters, spaces, hyphens, and apostrophes",
			);
		}
		if (!nameRegex.test(lastname)) {
			validationErrors.push(
				"Last name can only contain letters, spaces, hyphens, and apostrophes",
			);
		}

		if (validationErrors.length > 0) {
			throw new AuthenticationError(
				validationErrors.join(", "),
				"VALIDATION_FAILED",
			);
		}
	}
}
