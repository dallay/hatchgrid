/**
 * Abstract repository interface for tag data access
 * Defines the contract for tag data operations without implementation details
 */

import type { Tag, TagColors } from "../models";

/**
 * Data required to create a new tag (without computed properties)
 */
export interface CreateTagRepositoryRequest {
	name: string;
	color: TagColors;
	subscribers: ReadonlyArray<string> | string;
}
/**
 * Repository interface for tag data operations
 * This interface abstracts the data access layer and allows for different implementations
 * (e.g., HTTP API, local storage, mock data) without affecting the domain logic
 */
export interface TagRepository {
	/**
	 * Fetch all tags for a workspace
	 * @returns Promise resolving to array of tags
	 */
	// workspaceId is optional for compatibility with older call sites;
	// when omitted implementations may read the current workspace from the store
	findAll(workspaceId?: string): Promise<Tag[]>;

	/**
	 * Find a specific tag by its ID
	 * @param id - The tag identifier (UUID)
	 * @returns Promise resolving to tag or null if not found
	 */
	findById(id: string): Promise<Tag | null>;

	/**
	 * Create a new tag
	 * @param tag - Tag data without id, createdAt, updatedAt and computed properties
	 * @returns Promise resolving to the created tag
	 */
	create(tag: CreateTagRepositoryRequest): Promise<Tag>;

	/**
	 * Update an existing tag
	 * @param id - The tag identifier (UUID)
	 * @param tag - Partial tag data to update
	 * @returns Promise resolving to the updated tag
	 */
	update(id: string, tag: Partial<Tag>): Promise<Tag>;

	/**
	 * Delete a tag by its ID
	 * @param id - The tag identifier (UUID)
	 * @returns Promise resolving when deletion is complete
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if a tag with the given name exists (case-insensitive)
	 * @param name - The tag name to check
	 * @param excludeId - Optional ID to exclude from the check (for updates)
	 * @returns Promise resolving to true if name exists, false otherwise
	 */
	existsByName(
		workspaceId?: string,
		name?: string,
		excludeId?: string,
	): Promise<boolean>;
}
