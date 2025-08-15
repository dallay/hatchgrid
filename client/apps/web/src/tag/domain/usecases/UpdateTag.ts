/**
 * Use case for updating existing tags
 * Encapsulates business logic for tag update operations
 */

import type { Tag } from "../models";
import { TagColors } from "../models";
import type { TagRepository } from "../repositories";
import { ValidationUtils } from "./shared/ValidationUtils";

/**
 * Data that can be updated for a tag
 */
export interface UpdateTagData {
	readonly name?: string;
	readonly color?: TagColors;
}

/**
 * Use case for updating an existing tag
 * Handles business logic for tag updates and validation
 */
export class UpdateTag {
	constructor(private readonly repository: TagRepository) {}

	/**
	 * Execute the use case to update an existing tag
	 * @param id - The tag ID to update
	 * @param updateData - The data to update
	 * @returns Promise resolving to the updated tag
	 */
	// Overloads: support execute(id, updateData) and execute(workspaceId, id, updateData)
	async execute(id: string, updateData: UpdateTagData): Promise<Tag>;
	async execute(
		workspaceId: string | undefined,
		id: string,
		updateData: UpdateTagData,
	): Promise<Tag>;
	async execute(
		a: string | undefined,
		b: string | UpdateTagData,
		c?: UpdateTagData,
	): Promise<Tag> {
		const workspaceId = c ? (a as string | undefined) : undefined;
		const id = c ? (b as string) : (a as string);
		const updateData = c ? c : (b as UpdateTagData);

		// Validate input
		this.validateTagId(id);
		this.validateUpdateData(updateData);

		// Check if tag exists
		const existingTag = await this.repository.findById(id);
		if (!existingTag) {
			throw new Error(`Tag with ID ${id} not found`);
		}

		// Validate unique name if name is being updated
		if (updateData.name && updateData.name !== existingTag.name) {
			await this.validateUniqueTagName(workspaceId, updateData.name, id);
		}

		// Prepare update data
		const sanitizedUpdateData = this.sanitizeUpdateData(updateData);

		// Update tag through repository
		const updatedTag = await this.repository.update(id, sanitizedUpdateData);

		return updatedTag;
	}

	/**
	 * Validate tag ID format
	 * @param id - The tag ID to validate
	 * @throws Error if ID is invalid
	 */
	private validateTagId(id: string): void {
		ValidationUtils.validateUuid(id, "Tag ID");
	}

	/**
	 * Validate update data according to business rules
	 * @param updateData - The update data to validate
	 * @throws Error if validation fails
	 */
	private validateUpdateData(updateData: UpdateTagData): void {
		// Validate name if provided
		if (updateData.name !== undefined) {
			ValidationUtils.validateNonEmptyString(updateData.name, "Tag name");
			ValidationUtils.validateStringLength(updateData.name, "Tag name", 50);
		}

		// Check if at least one valid field is provided (after name validation)
		const hasValidName =
			updateData.name !== undefined && updateData.name.trim() !== "";
		const hasValidColor = updateData.color !== undefined;

		if (!hasValidName && !hasValidColor) {
			throw new Error("At least one field must be provided for update");
		}

		// Validate color if provided
		if (updateData.color !== undefined) {
			if (!Object.values(TagColors).includes(updateData.color)) {
				throw new Error(`Invalid tag color: ${updateData.color}`);
			}
		}
	}

	/**
	 * Validate that tag name is unique (excluding current tag)
	 * @param name - The tag name to check
	 * @param excludeId - The ID of the tag being updated (to exclude from uniqueness check)
	 * @throws Error if name is already taken
	 */
	private async validateUniqueTagName(
		workspaceId: string | undefined,
		name: string,
		excludeId: string,
	): Promise<void> {
		if (!name || name.trim() === "") {
			throw new Error("Tag name cannot be empty");
		}

		await ValidationUtils.validateUniqueTagName(
			this.repository,
			workspaceId,
			name,
			excludeId,
		);
	}

	/**
	 * Sanitize and prepare update data
	 * @param updateData - Raw update data
	 * @returns Sanitized update data
	 */
	private sanitizeUpdateData(updateData: UpdateTagData): Partial<Tag> {
		const sanitized: Partial<Tag> = {};

		if (updateData.name !== undefined) {
			sanitized.name = updateData.name.trim();
		}

		if (updateData.color !== undefined) {
			sanitized.color = updateData.color;
		}

		return sanitized;
	}
}
