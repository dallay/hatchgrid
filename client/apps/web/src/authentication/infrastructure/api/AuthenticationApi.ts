import axios, { type AxiosResponse } from "axios";
import type { RegistrationData } from "../../application";
import type { Account } from "../../domain/models";
import {
	transformUserResponseToAccount,
	type UserResponse,
} from "../../domain/models";
import { logApiError } from "./utils/errorLogger";
import { mapAuthenticationError } from "./utils/errorMapper";

/**
 * Infrastructure layer API client for core authentication operations.
 * Handles login, registration, activation, and session management.
 * Focused specifically on authentication flows, not account management.
 */
export class AuthenticationApi {
	/**
	 * Activates a user account using the provided activation key.
	 * @param activationKey - The activation key from the email
	 * @throws {AuthenticationError} When activation fails
	 */
	async activateAccount(activationKey: string): Promise<void> {
		try {
			await axios.get(`/api/activate?key=${activationKey}`, {
				withCredentials: true,
			});
		} catch (error) {
			logApiError("Account activation failed", error);
			throw mapAuthenticationError(error, "activation");
		}
	}

	/**
	 * Authenticates a user with username and password.
	 * @param credentials - User login credentials
	 * @returns Promise resolving to Account if successful
	 * @throws {InvalidCredentialsError} For invalid credentials
	 * @throws {AuthenticationError} For other authentication failures
	 */
	async authenticate(credentials: {
		username: string;
		password: string;
	}): Promise<Account> {
		try {
			// First, perform authentication
			await axios.post("/api/authenticate", credentials, {
				withCredentials: true,
			});

			// Then fetch the account information
			const accountResponse: AxiosResponse<UserResponse> = await axios.get(
				"/api/account",
				{
					withCredentials: true,
				},
			);

			const account = transformUserResponseToAccount(accountResponse.data);

			if (!account?.username) {
				throw new Error("Invalid account data received");
			}

			return account;
		} catch (error) {
			logApiError("Authentication failed", error);
			throw mapAuthenticationError(error, "login");
		}
	}

	/**
	 * Registers a new user account.
	 * @param registrationData - The registration information
	 * @throws {AuthenticationError} For registration failures
	 */
	async register(registrationData: RegistrationData): Promise<void> {
		try {
			await axios.post("/api/register", registrationData, {
				withCredentials: true,
			});
		} catch (error) {
			logApiError("Registration failed", error);
			throw mapAuthenticationError(error, "registration");
		}
	}

	/**
	 * Logs out the current user session.
	 * @returns Promise that resolves when logout is complete
	 */
	async logout(): Promise<void> {
		try {
			await axios.post(
				"/api/logout",
				{},
				{
					withCredentials: true,
				},
			);
		} catch (error) {
			// Don't throw on logout failure - we still want to clear local state
			logApiError("Logout failed, but continuing", error);
		}
	}
}
