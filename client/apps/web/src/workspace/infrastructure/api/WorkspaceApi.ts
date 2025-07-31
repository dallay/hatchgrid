/**
 * WorkspaceApi implementation of WorkspaceRepository interface.
 * Handles HTTP communication with the workspace API endpoints.
 */

import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import {
	InvalidWorkspaceIdError,
	WorkspaceApiError,
} from "../../domain/errors/WorkspaceErrors";
import type { Workspace } from "../../domain/models/Workspace";
import { isValidUUID } from "../../domain/models/WorkspaceValidation";
import type { WorkspaceRepository } from "../../domain/repositories/WorkspaceRepository";
import {
	AxiosHttpClient,
	type HttpRequestConfig,
	type IHttpClient,
} from "../http/HttpClient";
import {
	validateCollectionResponse,
	validateSingleItemResponse,
	validateWorkspaceData,
} from "../validation/ResponseValidator";

/**
 * API implementation of the WorkspaceRepository interface.
 * Communicates with the backend REST API for workspace operations.
 * Uses dependency injection for HTTP client to improve testability.
 */
export class WorkspaceApi implements WorkspaceRepository {
	private readonly httpClient: IHttpClient;

	constructor(
		httpClient?: IHttpClient,
		config: HttpRequestConfig = {}
	) {
		this.httpClient = httpClient ?? new AxiosHttpClient(config);
	}



	/**
	 * Retrieves all workspaces accessible to the current user.
	 * Makes a GET request to /api/workspace endpoint with retry logic.
	 *
	 * @returns Promise resolving to a collection of workspaces
	 * @throws {WorkspaceApiError} When the API request fails
	 * @throws {InvalidResponseFormatError} When response format is invalid
	 */
	async list(): Promise<CollectionResponse<Workspace>> {
		try {
			const data = await this.httpClient.get<CollectionResponse<Workspace>>("/api/workspace");

			// Validate response structure
			validateCollectionResponse(data, "workspace");

			// Validate each workspace object
			for (const workspace of data.data) {
				validateWorkspaceData(workspace);
			}

			return data;
		} catch (error) {
			// Re-throw domain errors as-is
			if (error instanceof InvalidWorkspaceIdError) {
				throw error;
			}

			// Wrap other errors in WorkspaceApiError
			throw new WorkspaceApiError("list workspaces", undefined, error);
		}
	}

	/**
	 * Retrieves a specific workspace by its ID.
	 * Makes a GET request to /api/workspace/{id} endpoint with retry logic.
	 *
	 * @param id - The workspace UUID
	 * @returns Promise resolving to workspace data or null if not found
	 * @throws {InvalidWorkspaceIdError} When the ID format is invalid
	 * @throws {WorkspaceApiError} When the API request fails (excluding 404)
	 */
	async getById(id: string): Promise<SingleItemResponse<Workspace> | null> {
		// Validate UUID format before making the API call
		if (!isValidUUID(id)) {
			throw new InvalidWorkspaceIdError(id);
		}

		try {
			const data = await this.httpClient.get<SingleItemResponse<Workspace>>(`/api/workspace/${id}`);

			// Validate response structure
			validateSingleItemResponse(data, "workspace");
			validateWorkspaceData(data.data);

			return data;
		} catch (error) {
			// Handle 404 responses specially - return null as per interface contract
			if (error instanceof Error && error.message.includes('(404)')) {
				return null;
			}

			// Re-throw domain errors as-is
			if (error instanceof InvalidWorkspaceIdError) {
				throw error;
			}

			// Wrap other errors in WorkspaceApiError
			throw new WorkspaceApiError(`get workspace ${id}`, undefined, error);
		}
	}
}
