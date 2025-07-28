/**
 * Abstract repository interface for subscriber data access
 * Defines the contract for subscriber data operations without implementation details
 */

import type {
	CountByStatusResponse,
	CountByTagsResponse,
	Subscriber,
} from "../models";

/**
 * Repository interface for subscriber data operations
 * This interface abstracts the data access layer and allows for different implementations
 * (e.g., HTTP API, local storage, mock data) without affecting the domain logic
 */
export interface SubscriberRepository {
	/**
	 * Fetch all subscribers for a workspace with optional filtering
	 * @param workspaceId - The workspace identifier
	 * @param filters - Optional key-value pairs for filtering subscribers
	 * @returns Promise resolving to array of subscribers
	 */
	fetchAll(
		workspaceId: string,
		filters?: Record<string, string>,
	): Promise<Subscriber[]>;

	/**
	 * Count subscribers grouped by their status
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to array of count by status responses
	 */
	countByStatus(workspaceId: string): Promise<CountByStatusResponse[]>;

	/**
	 * Count subscribers grouped by tag values
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to array of count by tags responses
	 */
	countByTags(workspaceId: string): Promise<CountByTagsResponse[]>;
}
