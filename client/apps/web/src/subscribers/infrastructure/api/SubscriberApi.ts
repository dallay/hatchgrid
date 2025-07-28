/**
 * HTTP API implementation of SubscriberRepository interface
 * Handles communication with the backend API for subscriber operations
 */

import axios, { type AxiosResponse, isAxiosError } from "axios";
import type PageResponse from "@/shared/PageResponse";
import type {
	CountByStatusResponse,
	CountByTagsResponse,
	Subscriber,
	SubscriberCountByStatusResponse,
	SubscriberCountByTagsResponse,
} from "../../domain/models";
import {
	countByStatusArraySchema,
	countByTagsArraySchema,
	subscribersArraySchema,
} from "../../domain/models";
import type { SubscriberRepository } from "../../domain/repositories/SubscriberRepository";

/**
 * API response types that match the backend structure
 */
interface ApiSubscriber {
	id: string;
	email: string;
	name?: string;
	status: string;
	attributes?: Record<string, unknown>;
	workspaceId: string;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Domain error types for API operations
 */
export class SubscriberApiError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly originalError?: unknown,
	) {
		super(message);
		this.name = "SubscriberApiError";
	}
}

export class SubscriberValidationError extends Error {
	constructor(
		message: string,
		public readonly validationErrors: unknown,
	) {
		super(message);
		this.name = "SubscriberValidationError";
	}
}

/**
 * Concrete implementation of SubscriberRepository using HTTP API
 * Integrates with existing axios configuration and interceptors
 */
export class SubscriberApi implements SubscriberRepository {
	private readonly baseUrl = "/api";

	/**
	 * API endpoint templates
	 */
	private static readonly ENDPOINTS = {
		subscribers: (workspaceId: string) =>
			`/workspace/${workspaceId}/newsletter/subscriber`,
		countByStatus: (workspaceId: string) =>
			`/workspace/${workspaceId}/newsletter/subscriber/count-by-status`,
		countByTags: (workspaceId: string) =>
			`/workspace/${workspaceId}/newsletter/subscriber/count-by-tags`,
	} as const;

	/**
	 * Transform API subscriber response to domain model
	 */
	private transformSubscriber(
		apiSubscriber: PageResponse<ApiSubscriber>,
	): Array<Subscriber> {
		return apiSubscriber.data.map((item) => ({
			id: item.id,
			email: item.email,
			name: item.name,
			status: item.status as Subscriber["status"],
			attributes: item.attributes as Subscriber["attributes"],
			workspaceId: item.workspaceId,
			createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
			updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
		}));
	}

	/**
	 * Transform API count by status response to domain model
   * {
    "data": [
        {
            "status": "ENABLED",
            "count": 1
        }
    ]
}
    @param apiResponse - The API response object
	 */
	private transformCountByStatus(
		apiResponse: SubscriberCountByStatusResponse,
	): Array<CountByStatusResponse> {
		return apiResponse.data.map((item) => ({
			count: item.count,
			status: item.status,
		}));
	}

	/**
	 * Transform API count by tags response to domain model
   * {
    "data": [
        {
            "tag": "feature",
            "count": 1
        },
        {
            "tag": "bug",
            "count": 1
        },
        {
            "tag": "documentation",
            "count": 1
        }
    ]
}
    * @param apiResponse - The API response object
	 */
	private transformCountByTags(
		apiResponse: SubscriberCountByTagsResponse,
	): Array<CountByTagsResponse> {
		return apiResponse.data.map((item) => ({
			count: item.count,
			tag: item.tag,
		}));
	}

	/**
	 * Error status code to message mapping
	 */
	private static readonly ERROR_MESSAGES = {
		400: (operation: string) => `Invalid request for ${operation}`,
		401: (operation: string) => `Authentication required for ${operation}`,
		403: (operation: string) => `Access denied for ${operation}`,
		404: (operation: string) => `Resource not found for ${operation}`,
		500: (operation: string) => `Server error during ${operation}`,
	} as const;

	/**
	 * Handle API errors and transform them to domain errors
	 */
	private handleApiError(error: unknown, operation: string): never {
		// If it's already a domain error, re-throw it
		if (
			error instanceof SubscriberValidationError ||
			error instanceof SubscriberApiError
		) {
			throw error;
		}

		if (isAxiosError(error)) {
			const statusCode = error.response?.status;
			const message = error.response?.data?.message || error.message;

			// Handle validation errors separately
			if (statusCode === 400) {
				throw new SubscriberValidationError(
					`${SubscriberApi.ERROR_MESSAGES[400](operation)}: ${message}`,
					error.response?.data,
				);
			}

			// Handle other HTTP errors
			const errorMessage =
				statusCode && statusCode in SubscriberApi.ERROR_MESSAGES
					? SubscriberApi.ERROR_MESSAGES[
							statusCode as keyof typeof SubscriberApi.ERROR_MESSAGES
						](operation)
					: `API error during ${operation}: ${message}`;

			throw new SubscriberApiError(errorMessage, statusCode, error);
		}

		throw new SubscriberApiError(
			`Unknown error during ${operation}`,
			undefined,
			error,
		);
	}

	/**
	 * Build query parameters string from filters object
	 */
	private buildQueryParams(filters?: Record<string, string>): string {
		if (!filters || Object.keys(filters).length === 0) {
			return "";
		}

		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value?.trim()) {
				params.append(key, value.trim());
			}
		});

		const queryString = params.toString();
		return queryString ? `?${queryString}` : "";
	}

	/**
	 * Generic method to handle API requests with transformation and validation
	 */
	private async makeApiRequest<TApiResponse, TDomainResponse>(
		url: string,
		transformer: (apiData: TApiResponse) => TDomainResponse[],
		validator: (data: TDomainResponse[]) => {
			success: boolean;
			data?: TDomainResponse[];
			error?: unknown;
		},
		operation: string,
		validationErrorMessage: string,
	): Promise<TDomainResponse[]> {
		try {
			const response: AxiosResponse<TApiResponse> = await axios.get(url, {
				withCredentials: true,
			});

			// Transform API response to domain models (transformer returns an array)
			const transformedData = transformer(response.data);

			// Validate the transformed data using domain schemas
			const validationResult = validator(transformedData);
			if (!validationResult.success) {
				throw new SubscriberValidationError(
					validationErrorMessage,
					validationResult.error,
				);
			}

			return validationResult.data ?? [];
		} catch (error) {
			this.handleApiError(error, operation);
		}
	}

	/**
	 * Fetch all subscribers for a workspace with optional filtering
	 */
	/**
	 * Validate workspace ID format
	 */
	private validateWorkspaceId(workspaceId: string): void {
		if (!workspaceId?.trim()) {
			throw new SubscriberValidationError(
				"Workspace ID is required and cannot be empty",
				{ workspaceId },
			);
		}
	}

	async fetchAll(
		workspaceId: string,
		filters?: Record<string, string>,
	): Promise<Subscriber[]> {
		this.validateWorkspaceId(workspaceId);

		const queryParams = this.buildQueryParams(filters);
		const url = `${this.baseUrl}${SubscriberApi.ENDPOINTS.subscribers(workspaceId)}${queryParams}`;

		return this.makeApiRequest(
			url,
			this.transformSubscriber.bind(this),
			subscribersArraySchema.safeParse.bind(subscribersArraySchema),
			"fetchAll subscribers",
			"Invalid subscriber data received from API",
		);
	}

	/**
	 * Count subscribers grouped by their status
	 */
	async countByStatus(workspaceId: string): Promise<CountByStatusResponse[]> {
		this.validateWorkspaceId(workspaceId);

		const url = `${this.baseUrl}${SubscriberApi.ENDPOINTS.countByStatus(workspaceId)}`;

		return this.makeApiRequest(
			url,
			this.transformCountByStatus.bind(this),
			countByStatusArraySchema.safeParse.bind(countByStatusArraySchema),
			"countByStatus",
			"Invalid count by status data received from API",
		);
	}

	/**
	 * Count subscribers grouped by tag values
	 */
	async countByTags(workspaceId: string): Promise<CountByTagsResponse[]> {
		this.validateWorkspaceId(workspaceId);

		const url = `${this.baseUrl}${SubscriberApi.ENDPOINTS.countByTags(workspaceId)}`;

		return this.makeApiRequest(
			url,
			this.transformCountByTags.bind(this),
			countByTagsArraySchema.safeParse.bind(countByTagsArraySchema),
			"countByTags",
			"Invalid count by tags data received from API",
		);
	}
}
