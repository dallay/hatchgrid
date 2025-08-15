/**
 * Use case for deleting tags
 * Encapsulates business logic for tag deletion operations
 */

import type { Tag } from "../models/Tag.ts";
import type { TagRepository } from "../repositories";
import { TagNotFoundError, TagValidationError } from "./shared/TagErrors";
import { ValidationUtils } from "./shared/ValidationUtils";

/**
 * Use case for deleting an existing tag
 * Handles business logic for tag deletion and validation
 */
export class DeleteTag {
	constructor(private readonly repository: TagRepository) {}

	/**
	 * Execute the use case to delete a tag
	 * @param id - The tag ID to delete
	 * @returns Promise resolving when deletion is complete
	 */
	async execute(id: string): Promise<void> {
		// Validate input
		this.validateTagId(id);

		// Check if tag exists
		const existingTag = await this.repository.findById(id);
		if (!existingTag) {
			throw new TagNotFoundError(id);
		}

		// Apply business rules for deletion
		await this.validateDeletionRules(existingTag);

		// Delete tag through repository
		await this.repository.delete(id);
	}

	/**
	 * Validate tag ID format
	 * @param id - The tag ID to validate
	 * @throws TagValidationError if ID is invalid
	 */
	private validateTagId(id: string): void {
		try {
			ValidationUtils.validateUuid(id, "Tag ID");
		} catch (error) {
			if (error instanceof Error) {
				throw new TagValidationError(error.message, "id");
			}
			throw error;
		}
	}

	/**
	 * Get subscriber count with proper null/NaN handling
	 * @param tag - The tag to get subscriber count for
	 * @returns The subscriber count as a number
	 */
	private getSubscriberCount(tag: Tag): number {
		return Number.isNaN(tag.subscriberCount) ? 0 : tag.subscriberCount;
	}

	/**
	 * Validate business rules for tag deletion
	 * @param tag - The tag to be deleted
	 * @throws Error if deletion is not allowed
	 */
	private async validateDeletionRules(tag: Tag): Promise<void> {
		// Business rule: Check if tag has subscribers
		const subscriberCount = this.getSubscriberCount(tag);

		if (subscriberCount > 0) {
			// For now, we'll allow deletion of tags with subscribers
			// In a real application, you might want to:
			// 1. Prevent deletion and show a warning
			// 2. Offer to remove the tag from all subscribers first
			// 3. Archive the tag instead of deleting it

			// TODO: Replace with proper logger when available
			console.warn("Tag deletion with subscribers", {
				tagId: tag.id,
				tagName: tag.name,
				subscriberCount,
				action: "delete_tag_with_subscribers",
			});
		}

		// Additional business rules can be added here
		// For example:
		// - Check if tag is marked as "system" or "protected"
		// - Check user permissions for deletion
		// - Log the deletion for audit purposes
	}

	/**
	 * Check if a tag can be safely deleted
	 * @param id - The tag ID to check
	 * @returns Promise resolving to boolean indicating if deletion is safe
	 */
	async canDelete(id: string): Promise<boolean> {
		try {
			this.validateTagId(id);
		} catch (error) {
			// Validation errors should be treated as "cannot delete"
			if (error instanceof TagValidationError) {
				return false;
			}
			// Re-throw unexpected errors
			throw error;
		}

		try {
			const existingTag = await this.repository.findById(id);
			if (!existingTag) {
				return false; // Tag doesn't exist
			}

			// Apply business rules check without throwing
			// For now, we allow deletion regardless of subscriber count
			// Future business rules could check:
			// - Tag protection status
			// - User permissions
			// - Subscriber count thresholds
			return true;
		} catch (repositoryError) {
			// Repository errors should be logged but treated as "cannot delete"
			console.error("Repository error in canDelete:", repositoryError);
			return false;
		}
	}
}
