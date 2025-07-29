/**
 * Use case for counting subscribers by their status
 * Encapsulates business logic for subscriber status aggregation
 */

import type { CountByStatusResponse } from "../models";
import { SubscriberStatus } from "../models";
import type { SubscriberRepository } from "../repositories";

/**
 * Use case for counting subscribers grouped by status
 * Handles business logic for status counting and aggregation
 */
export class CountByStatus {
	constructor(private readonly repository: SubscriberRepository) {}

	/**
	 * Execute the use case to count subscribers by status
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to array of count by status responses
	 */
	async execute(workspaceId: string): Promise<CountByStatusResponse[]> {
		// Validate workspace ID
		if (!workspaceId || workspaceId.trim() === "") {
			throw new Error("Workspace ID is required");
		}

		// Fetch counts from repository
		const counts = await this.repository.countByStatus(workspaceId);

		// Apply business logic transformations
		return this.processStatusCounts(counts);
	}

	/**
	 * Process and validate status counts from repository
	 * Ensures all expected statuses are present and counts are valid
	 * @param counts - Raw counts from repository
	 * @returns Processed and validated counts
	 */
	private processStatusCounts(
		counts: CountByStatusResponse[],
	): CountByStatusResponse[] {
		// Validate that all counts are non-negative
		const validatedCounts = counts.map((count) => {
			if (count.count < 0) {
				throw new Error(
					`Invalid count value: ${count.count} for status: ${count.status}`,
				);
			}
			return count;
		});

		// Ensure all expected statuses are present (fill missing with 0)
		const statusMap = new Map<SubscriberStatus, number>();

		// Initialize all statuses with 0
		Object.values(SubscriberStatus).forEach((status) => {
			statusMap.set(status, 0);
		});

		// Update with actual counts
		validatedCounts.forEach((count) => {
			const status = count.status as SubscriberStatus;
			if (Object.values(SubscriberStatus).includes(status)) {
				statusMap.set(status, count.count);
			}
		});

		// Convert back to response format
		return Array.from(statusMap.entries()).map(([status, count]) => ({
			status,
			count,
		}));
	}

	/**
	 * Get total count across all statuses
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to total subscriber count
	 */
	async getTotalCount(workspaceId: string): Promise<number> {
		const counts = await this.execute(workspaceId);
		return counts.reduce((total, count) => total + count.count, 0);
	}

	/**
	 * Get count for a specific status
	 * @param workspaceId - The workspace identifier
	 * @param status - The status to count
	 * @returns Promise resolving to count for the specified status
	 */
	async getCountForStatus(
		workspaceId: string,
		status: SubscriberStatus,
	): Promise<number> {
		const counts = await this.execute(workspaceId);
		const statusCount = counts.find((count) => count.status === status);
		return statusCount?.count ?? 0;
	}
}
