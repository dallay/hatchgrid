/**
 * Use case for fetching tags
 * Encapsulates business logic for tag retrieval operations
 */

import type { Tag } from "../models";
import type { TagRepository } from "../repositories";

/**
 * Use case for fetching all tags
 * Handles business logic for tag data retrieval
 */
export class FetchTags {
	constructor(private readonly repository: TagRepository) {}

	/**
	 * Execute the use case to fetch all tags
	 * @param workspaceId - ID of the workspace to fetch tags for
	 * @returns Promise resolving to array of tags
	 */
	// workspaceId optional for backwards compatibility with tests
	async execute(workspaceId?: string): Promise<Tag[]> {
		// Fetch tags from repository for the given workspace (or global if omitted)
		const tags = await this.repository.findAll(
			workspaceId as string | undefined,
		);

		// Apply any additional business logic processing if needed
		return this.processTagsData(tags);
	}

	/**
	 * Process and validate tags data from repository
	 * Ensures data integrity and applies business rules
	 * @param tags - Raw tags from repository
	 * @returns Processed and validated tags
	 */
	private processTagsData(tags: Tag[]): Tag[] {
		// Ensure we have an array to work with
		if (!Array.isArray(tags)) {
			throw new Error(
				"Repository returned invalid data format: expected array of tags",
			);
		}

		// Validate tag data and filter out invalid entries
		const validatedTags = tags.filter((tag) => {
			// Ensure required fields are present and valid
			const isValid = Boolean(
				tag?.id?.trim() &&
					tag?.name?.trim() &&
					tag?.color !== null &&
					tag?.color !== undefined,
			);

			if (!isValid) {
				console.warn("Invalid tag data found and filtered out:", {
					id: tag?.id,
					name: tag?.name,
					color: tag?.color,
				});
			}

			return isValid;
		});

		// Sort tags by name for consistent ordering (case-insensitive)
		return validatedTags.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
		);
	}

	/**
	 * Get total count of tags
	 * @returns Promise resolving to total tag count
	 */
	async getTotalCount(): Promise<number> {
		const tags = await this.execute();
		return tags.length;
	}

	/**
	 * Find tags by color
	 * @param color - The color to filter by
	 * @returns Promise resolving to tags with the specified color
	 */
	async findByColor(color: string): Promise<Tag[]> {
		if (!color?.trim()) {
			return [];
		}

		const tags = await this.execute();
		return tags.filter((tag) => tag.color === color);
	}
}
