/**
 * Use case for counting subscribers by tag values
 * Encapsulates business logic for subscriber tag aggregation
 */

import type { CountByTagsResponse } from "../models";
import type { SubscriberRepository } from "../repositories";

/**
 * Use case for counting subscribers grouped by tag values
 * Handles business logic for tag counting and aggregation
 */
export class CountByTags {
	constructor(private readonly repository: SubscriberRepository) {}

	/**
	 * Execute the use case to count subscribers by tags
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to array of count by tags responses
	 */
	async execute(workspaceId: string): Promise<CountByTagsResponse[]> {
		// Validate workspace ID
		if (!workspaceId || workspaceId.trim() === "") {
			throw new Error("Workspace ID is required");
		}

		// Fetch counts from repository
		const counts = await this.repository.countByTags(workspaceId);

		// Apply business logic transformations
		return this.processTagCounts(counts);
	}

	/**
	 * Process and validate tag counts from repository
	 * Ensures counts are valid and applies business rules
	 * @param counts - Raw counts from repository
	 * @returns Processed and validated counts
	 */
	private processTagCounts(
		counts: CountByTagsResponse[],
	): CountByTagsResponse[] {
		// Validate that all counts are non-negative
		const validatedCounts = counts.map((count) => {
			if (count.count < 0) {
				throw new Error(
					`Invalid count value: ${count.count} for tag: ${count.tag}`,
				);
			}
			return count;
		});

		// Filter out empty or invalid tags
		const filteredCounts = validatedCounts.filter((count) => {
			return count.tag && count.tag.trim() !== "";
		});

		// Sort by count descending, then by tag name ascending for consistent ordering
		return filteredCounts.sort((a, b) => {
			if (a.count !== b.count) {
				return b.count - a.count; // Descending by count
			}
			return a.tag.localeCompare(b.tag); // Ascending by tag name
		});
	}

	/**
	 * Get total count across all tags
	 * @param workspaceId - The workspace identifier
	 * @returns Promise resolving to total count across all tags
	 */
	async getTotalCount(workspaceId: string): Promise<number> {
		const counts = await this.execute(workspaceId);
		return counts.reduce((total, count) => total + count.count, 0);
	}

	/**
	 * Get count for a specific tag
	 * @param workspaceId - The workspace identifier
	 * @param tag - The tag to count
	 * @returns Promise resolving to count for the specified tag
	 */
	async getCountForTag(workspaceId: string, tag: string): Promise<number> {
		if (!tag || tag.trim() === "") {
			return 0;
		}

		const counts = await this.execute(workspaceId);
		const tagCount = counts.find((count) => count.tag === tag.trim());
		return tagCount?.count ?? 0;
	}

	/**
	 * Get top N tags by count
	 * @param workspaceId - The workspace identifier
	 * @param limit - Maximum number of tags to return
	 * @returns Promise resolving to top tags by count
	 */
	async getTopTags(
		workspaceId: string,
		limit = 10,
	): Promise<CountByTagsResponse[]> {
		if (limit <= 0) {
			throw new Error("Limit must be greater than 0");
		}

		const counts = await this.execute(workspaceId);
		return counts.slice(0, limit);
	}

	/**
	 * Check if a tag exists in the workspace
	 * @param workspaceId - The workspace identifier
	 * @param tag - The tag to check
	 * @returns Promise resolving to true if tag exists, false otherwise
	 */
	async hasTag(workspaceId: string, tag: string): Promise<boolean> {
		const count = await this.getCountForTag(workspaceId, tag);
		return count > 0;
	}
}
