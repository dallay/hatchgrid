import axios, { type AxiosResponse } from "axios";
import type { Account } from "@/authentication/domain/models";
import {
	transformUserResponseToAccount,
	type UserResponse,
} from "@/authentication/domain/models";
import type { RegistrationData } from "../../application";
import { logApiError } from "./utils/errorLogger";
import { mapAuthenticationError, mapSessionError } from "./utils/errorMapper";

/**
 * Infrastructure layer API client for account management operations.
 * Handles account retrieval, updates, and profile management.
 * Focused specifically on account data, not authentication flows.
 */
export class AccountApi {
	/**
	 * Retrieves the current user's account information.
	 * @returns Promise resolving to Account or null if failed
	 * @throws {SessionExpiredError} When session has expired (401/403)
	 * @throws {AuthenticationError} For other account-related errors
	 */
	async getAccount(): Promise<Account | null> {
		try {
			const response: AxiosResponse<UserResponse> = await axios.get(
				"/api/account",
				{
					withCredentials: true,
				},
			);

			const account = transformUserResponseToAccount(response.data);
			return response.status === 200 && account?.username ? account : null;
		} catch (error) {
			const sessionError = mapSessionError(error);
			if (sessionError) {
				throw sessionError;
			}

			logApiError("Failed to retrieve account", error);
			throw mapAuthenticationError(error, "account retrieval");
		}
	}

	/**
	 * Updates the user's language preference.
	 * @param langKey - The new language key to set
	 * @returns Promise resolving to true if successful, false otherwise
	 * @throws {AccessDeniedError} When user is not authenticated
	 */
	async updateLanguage(langKey: string): Promise<boolean> {
		try {
			await axios.post(
				"/api/account/change-language",
				{ langKey },
				{
					withCredentials: true,
				},
			);
			return true;
		} catch (error) {
			const sessionError = mapSessionError(error);
			if (sessionError) {
				throw sessionError;
			}

			logApiError("Failed to update user language", error);
			return false;
		}
	}

	/**
	 * Updates the user's account information.
	 * @param accountData - The updated account data
	 * @returns Promise resolving to updated Account
	 * @throws {AccessDeniedError} When user is not authenticated
	 * @throws {AuthenticationError} For other update failures
	 */
	async updateAccount(accountData: Partial<Account>): Promise<Account> {
		try {
			const response: AxiosResponse<UserResponse> = await axios.post(
				"/api/account",
				accountData,
				{
					withCredentials: true,
				},
			);

			return transformUserResponseToAccount(response.data);
		} catch (error) {
			const sessionError = mapSessionError(error);
			if (sessionError) {
				throw sessionError;
			}

			logApiError("Failed to update account", error);
			throw mapAuthenticationError(error, "account update");
		}
	}

	/**
	 * Changes the user's password.
	 * @param currentPassword - The current password
	 * @param newPassword - The new password
	 * @throws {AccessDeniedError} When user is not authenticated
	 * @throws {AuthenticationError} For password change failures
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<void> {
		try {
			await axios.post(
				"/api/account/change-password",
				{ currentPassword, newPassword },
				{
					withCredentials: true,
				},
			);
		} catch (error) {
			const sessionError = mapSessionError(error);
			if (sessionError) {
				throw sessionError;
			}

			logApiError("Failed to change password", error);
			throw mapAuthenticationError(error, "password change");
		}
	}

	/**
	 * Authenticates a user with username and password.
	 * @param username - The username
	 * @param password - The password
	 * @returns Promise resolving to Account if successful
	 * @throws {InvalidCredentialsError} For invalid credentials
	 * @throws {AuthenticationError} For other authentication failures
	 */
	async login(username: string, password: string): Promise<Account> {
		try {
			// First, perform authentication
			await axios.post(
				"/api/authenticate",
				{ username, password },
				{
					withCredentials: true,
				},
			);

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
	 * Retrieves application profiles information.
	 * @returns Promise resolving to ProfileInfo or null if failed
	 */
	async getProfiles(): Promise<{ activeProfiles: string[] } | null> {
		try {
			const response = await axios.get("/actuator/info", {
				withCredentials: true,
			});
			return response.data;
		} catch (error) {
			logApiError("Failed to retrieve profiles", error);
			return null;
		}
	}
}
