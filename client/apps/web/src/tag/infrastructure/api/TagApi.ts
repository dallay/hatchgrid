/**
 * HTTP API implementation of TagRepository interface
 * Handles communication with the backend API for tag operations
 */

import axios, {
	type AxiosError,
	type AxiosResponse,
	isAxiosError,
} from "axios";
import type { TagRepository } from "@/tag/domain";
import { Tag } from "@/tag/domain/models/Tag";
import type { TagResponse } from "@/tag/domain/models/TagResponse";

/**
 * Domain error types for API operations
 */
export class TagApiError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly originalError?: unknown,
	) {
		super(message);
		this.name = "TagApiError";
	}
}

export class TagValidationError extends Error {
	constructor(
		message: string,
		public readonly validationErrors: unknown,
	) {
		super(message);
		this.name = "TagValidationError";
	}
}

export class TagNotFoundError extends Error {
	constructor(id: string) {
		super(`Tag with id ${id} not found`);
		this.name = "TagNotFoundError";
	}
}

/**
 * Concrete implementation of TagRepository using HTTP API
 * Integrates with existing axios configuration and interceptors
 */
export class TagApi implements TagRepository {
	private readonly baseUrl = "/api";

	private static readonly ENDPOINTS = {
		tags: (workspaceId: string) => `/workspace/${workspaceId}/tag`,
		tagById: (id: string) => `/tags/${id}`,
	} as const;

	/**
	 * Transform API tag response to domain model
	 */
	private transformTag(response: AxiosResponse<unknown>): Tag {
		const payload = response?.data;
		const tagPayload =
			payload && typeof payload === "object"
				? // support envelopes like { data: {...} }
					((payload as Record<string, unknown>).data ?? payload)
				: payload;

		if (!tagPayload || typeof tagPayload !== "object") {
			throw new TagApiError(
				`Invalid tag response shape: ${JSON.stringify(payload)}`,
				undefined,
				response,
			);
		}

		return Tag.fromResponse(tagPayload as TagResponse);
	}

	/**
	 * Transform API tags array response to domain models
	 */
	private transformTags(response: AxiosResponse<unknown>): Tag[] {
		const payload = response?.data;

		// Accept either an array directly or envelopes like { data: [...] } or { tags: [...] }
		const asRecord = payload as Record<string, unknown> | null;

		// Refactor nested ternary operators into a more readable structure
		const items: unknown = (() => {
			if (Array.isArray(payload)) {
				return payload;
			}
			if (Array.isArray(asRecord?.data)) {
				return asRecord?.data;
			}
			if (Array.isArray(asRecord?.tags)) {
				return asRecord?.tags;
			}
			return null;
		})();

		if (!Array.isArray(items)) {
			throw new TagApiError(
				`Invalid tags response shape: ${JSON.stringify(payload)}`,
				undefined,
				response,
			);
		}

		return items.map((tag) => Tag.fromResponse(tag as TagResponse));
	}

	/**
	 * Error status code to message mapping
	 */
	private static readonly ERROR_MESSAGES: Record<
		number,
		(operation: string) => string
	> = {
		400: (operation: string) => `Invalid request for ${operation}`,
		401: (operation: string) => `Authentication required for ${operation}`,
		403: (operation: string) => `Access denied for ${operation}`,
		404: (operation: string) => `Resource not found for ${operation}`,
		409: (operation: string) => `Conflict during ${operation}`,
		500: (operation: string) => `Server error during ${operation}`,
	} as const;

	/**
	 * Handle API errors and transform them to domain errors
	 */
	private handleApiError(error: unknown, operation: string): never {
		// If it's already a domain error, re-throw it
		if (
			error instanceof TagValidationError ||
			error instanceof TagApiError ||
			error instanceof TagNotFoundError
		) {
			throw error;
		}

		if (isAxiosError(error)) {
			const statusCode = error.response?.status;
			const message = error.response?.data?.message || error.message;

			// Handle not found errors
			if (statusCode === 404) {
				// Try to extract an ID from the request URL if present (e.g., /api/tags/{id})
				const requestUrl = (error as AxiosError)?.config?.url;
				const idMatch = requestUrl?.match(/\/api\/tags\/([^/?]+)/);
				if (idMatch?.[1]) {
					throw new TagNotFoundError(idMatch[1]);
				}
				// Fallback to a generic API error for 404 when no ID can be determined
				throw new TagApiError(
					`${TagApi.ERROR_MESSAGES[404](operation)}: ${message}`,
					404,
					error,
				);
			}

			// Handle validation errors separately
			if (statusCode === 400) {
				throw new TagValidationError(
					`${TagApi.ERROR_MESSAGES[400](operation)}: ${message}`,
					error.response?.data,
				);
			}

			// Handle conflict errors (e.g., duplicate tag name)
			if (statusCode === 409) {
				throw new TagValidationError(
					`${TagApi.ERROR_MESSAGES[409](operation)}: ${message}`,
					error.response?.data,
				);
			}

			// Handle other HTTP errors
			const errorMessage =
				statusCode && TagApi.ERROR_MESSAGES[statusCode]
					? TagApi.ERROR_MESSAGES[statusCode](operation)
					: `API error during ${operation}: ${message}`;

			throw new TagApiError(errorMessage, statusCode, error);
		}

		throw new TagApiError(
			`Unknown error during ${operation}: ${
				error instanceof Error ? error.message : String(error)
			}`,
			undefined,
			error,
		);
	}

	/**
	 * Fetch all tags
	 * @param workspaceId - The workspace ID to fetch tags for
	 */
	async findAll(workspaceId: string): Promise<Tag[]> {
		const url = `${this.baseUrl}${TagApi.ENDPOINTS.tags(workspaceId)}`;
		try {
			const response = await axios.get<TagResponse[]>(url, {
				withCredentials: true,
			});
			return this.transformTags(response);
		} catch (error) {
			this.handleApiError(error, "fetch all tags");
		}
	}

	/**
	 * Find tag by ID
	 */
	async findById(id: string): Promise<Tag | null> {
		if (!id?.trim()) {
			throw new TagValidationError("Tag ID is required and cannot be empty", {
				id,
			});
		}

		try {
			const response = await axios.get<TagResponse>(`${this.baseUrl}/${id}`, {
				withCredentials: true,
			});
			return this.transformTag(response);
		} catch (error) {
			if (isAxiosError(error) && error.response?.status === 404) {
				return null;
			}
			this.handleApiError(error, `fetch tag ${id}`);
		}
	}

	/**
	 * Create a new tag
	 */
	async create(
		tag: Omit<Tag, "id" | "createdAt" | "updatedAt">,
		workspaceId?: string,
	): Promise<Tag> {
		if (!tag.name?.trim()) {
			throw new TagValidationError("Tag name is required and cannot be empty", {
				name: tag.name,
			});
		}

		if (!tag.color) {
			throw new TagValidationError("Tag color is required", {
				color: tag.color,
			});
		}

		try {
			const response = await axios.post<TagResponse>(
				`${this.baseUrl}${TagApi.ENDPOINTS.tags(workspaceId as string)}/${crypto.randomUUID()}`,
				tag,
				{
					withCredentials: true,
				},
			);
			return this.transformTag(response);
		} catch (error) {
			this.handleApiError(error, "create tag");
		}
	}

	/**
	 * Update an existing tag
	 */
	async update(
		id: string,
		tag: Partial<Tag>,
		workspaceId?: string,
	): Promise<Tag> {
		if (!id?.trim()) {
			throw new TagValidationError("Tag ID is required and cannot be empty", {
				id,
			});
		}

		if (tag.name !== undefined && !tag.name?.trim()) {
			throw new TagValidationError("Tag name cannot be empty when provided", {
				name: tag.name,
			});
		}

		try {
			if (!workspaceId) {
				throw new TagValidationError(
					"Workspace ID is required for updating tags",
					{ id, workspaceId },
				);
			}

			const response = await axios.put<TagResponse>(
				`${this.baseUrl}${TagApi.ENDPOINTS.tags(workspaceId)}/${id}`,
				tag,
				{
					withCredentials: true,
				},
			);
			return this.transformTag(response);
		} catch (error) {
			this.handleApiError(error, `update tag ${id}`);
		}
	}

	/**
	 * Delete a tag
	 */
	async delete(id: string, workspaceId?: string): Promise<void> {
		if (!id?.trim()) {
			throw new TagValidationError("Tag ID is required and cannot be empty", {
				id,
			});
		}

		try {
			if (!workspaceId) {
				throw new TagValidationError(
					"Workspace ID is required for deleting tags",
					{ id, workspaceId },
				);
			}

			await axios.delete(
				`${this.baseUrl}${TagApi.ENDPOINTS.tags(workspaceId)}/${id}`,
				{
					withCredentials: true,
				},
			);
		} catch (error) {
			this.handleApiError(error, `delete tag ${id}`);
		}
	}

	/**
	 * Check if a tag with the given name exists (case-insensitive)
	 * @param workspaceId - Workspace ID to filter tags by workspace
	 * @param name - The tag name to check
	 * @param excludeId - Optional ID to exclude from the check (for updates)
	 * @returns Promise resolving to true if name exists, false otherwise
	 */
	async existsByName(
		workspaceId: string,
		name?: string,
		excludeId?: string,
	): Promise<boolean> {
		try {
			const tags = await this.findAll(workspaceId);
			const normalizedName = (name || "").trim().toLowerCase();

			return tags.some(
				(tag) =>
					tag.name.toLowerCase() === normalizedName &&
					(!excludeId || tag.id !== excludeId),
			);
		} catch (error) {
			this.handleApiError(error, `check tag name existence: ${name}`);
		}
	}
}
