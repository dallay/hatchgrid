import axios, { type AxiosResponse } from "axios";
import { logApiError } from "./utils/errorLogger";

export interface ProfileInfo {
	activeProfiles: string[];
	"display-ribbon-on-profiles"?: string;
	git?: {
		branch?: string;
		commit?: {
			id?: string;
			time?: string;
		};
	};
	build?: {
		version?: string;
		timestamp?: string;
	};
}

/**
 * API client for application profile information.
 * Handles retrieval of system and build information.
 */
export class ProfileApi {
	/**
	 * Retrieves application profile information from the backend.
	 * @returns Promise resolving to ProfileInfo or null if failed
	 */
	async getProfiles(): Promise<ProfileInfo | null> {
		try {
			const response: AxiosResponse<ProfileInfo> = await axios.get(
				"/actuator/info",
				{
					withCredentials: true,
				},
			);

			return response.data;
		} catch (error) {
			logApiError("Failed to retrieve application profiles", error);
			return null;
		}
	}
}
