/**
 * Use case for fetching subscribers with filtering capabilities
 * Encapsulates business logic for subscriber retrieval operations
 */

import type { Subscriber } from "../models";
import type { SubscriberRepository } from "../repositories";

/**
 * Filters that can be applied when fetching subscribers
 */
export interface FetchSubscribersFilters {
	readonly status?: string;
	readonly email?: string;
	readonly name?: string;
	readonly tag?: string;
	readonly [key: string]: string | undefined;
}

/**
 * Use case for fetching subscribers from a workspace
 * Handles business logic for filtering and data retrieval
 */
export class FetchSubscribers {
	constructor(private readonly repository: SubscriberRepository) {}

	/**
	 * Execute the use case to fetch subscribers
	 * @param workspaceId - The workspace identifier
	 * @param filters - Optional filters to apply
	 * @returns Promise resolving to filtered subscribers
	 */
	async execute(
		workspaceId: string,
		filters?: FetchSubscribersFilters,
	): Promise<Subscriber[]> {
		// Validate workspace ID
		if (!workspaceId || workspaceId.trim() === "") {
			throw new Error("Workspace ID is required");
		}

		// Convert filters to repository format (remove undefined values)
		const repositoryFilters = filters
			? this.sanitizeFilters(filters)
			: undefined;

		// Fetch subscribers from repository
		const subscribers = await this.repository.fetchAll(
			workspaceId,
			repositoryFilters,
		);

		// Apply any additional business logic filtering if needed
		return this.applyBusinessLogicFilters(subscribers, filters);
	}

	/**
	 * Remove undefined values from filters
	 * @param filters - Raw filters that may contain undefined values
	 * @returns Sanitized filters with only defined values
	 */
	private sanitizeFilters(
		filters: FetchSubscribersFilters,
	): Record<string, string> {
		const sanitized: Record<string, string> = {};

		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined && value.trim() !== "") {
				sanitized[key] = value;
			}
		}

		return sanitized;
	}

	/**
	 * Apply additional business logic filters that can't be handled at the repository level
	 * @param subscribers - Subscribers from repository
	 * @param filters - Original filters
	 * @returns Filtered subscribers
	 */
	private applyBusinessLogicFilters(
		subscribers: Subscriber[],
		filters?: FetchSubscribersFilters,
	): Subscriber[] {
		if (!filters) {
			return subscribers;
		}

		let filtered = subscribers;

		// Example: Case-insensitive email filtering (if not handled by repository)
		if (filters.email) {
			const emailFilter = filters.email.toLowerCase();
			filtered = filtered.filter((subscriber) =>
				subscriber.email.toLowerCase().includes(emailFilter),
			);
		}

		// Example: Case-insensitive name filtering (if not handled by repository)
		if (filters.name) {
			const nameFilter = filters.name.toLowerCase();
			filtered = filtered.filter(
				(subscriber) =>
					subscriber.name?.toLowerCase().includes(nameFilter) ?? false,
			);
		}

		return filtered;
	}
}
