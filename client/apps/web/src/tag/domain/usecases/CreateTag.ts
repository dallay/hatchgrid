/**
 * Use case for creating new tags
 * Encapsulates business logic for tag creation operations
 */

import type { ZodError } from "zod";
import type { Tag, TagColors } from "../models";
import { createTagRequestSchema } from "../models/schemas";
import type {
	CreateTagRepositoryRequest,
	TagRepository,
} from "../repositories";
import {
	formatValidationErrors,
	ValidationUtils,
} from "./shared/ValidationUtils";

/**
 * Data required to create a new tag
 */
export interface CreateTagData {
	readonly name: string;
	readonly color: TagColors;
}

/**
 * Use case for creating a new tag
 * Handles business logic for tag creation and validation
 */
export class CreateTag {
	constructor(private readonly repository: TagRepository) {}

	/**
	 * Execute the use case to create a new tag
	 * @param tagData - The tag data to create
	 * @returns Promise resolving to the created tag
	 */
	// Overloads: support both execute(tagData) and execute(workspaceId, tagData)
	async execute(tagData: CreateTagData): Promise<Tag>;
	async execute(
		workspaceId: string | undefined,
		tagData: CreateTagData,
	): Promise<Tag>;
	async execute(
		a: string | CreateTagData | undefined,
		b?: CreateTagData,
	): Promise<Tag> {
		const workspaceId: string | undefined = b
			? (a as string | undefined)
			: undefined;
		const tagData: CreateTagData = b ? b : (a as CreateTagData);

		// Validate input data
		this.validateTagData(tagData);

		// Normalize the tag name
		const normalizedName = tagData.name.trim();

		// Check for duplicate names (business rule)
		await this.validateUniqueTagName(workspaceId, normalizedName);

		// Prepare tag data for creation
		const tagToCreate: CreateTagRepositoryRequest = {
			name: normalizedName,
			color: tagData.color,
			subscribers: [], // New tags start with no subscribers
		};

		// Create tag through repository
		return await this.repository.create(tagToCreate);
	}

	/**
	 * Validate tag data according to business rules
	 * Uses Zod schema for consistent validation
	 * @param tagData - The tag data to validate
	 * @throws Error if validation fails
	 */
	private validateTagData(tagData: CreateTagData): void {
		const result = createTagRequestSchema.safeParse(tagData);

		if (!result.success) {
			// Create a user-friendly error message from validation errors
			const errorMessage = this.formatValidationErrors(result.error);
			throw new Error(errorMessage);
		}
	}

	/**
	 * Format Zod validation errors into user-friendly messages
	 * @param error - The ZodError containing validation issues
	 * @returns Formatted error message
	 */
	private formatValidationErrors(error: ZodError): string {
		return formatValidationErrors(error, ["name", "color"]);
	}

	/**
	 * Validate that tag name is unique
	 * @param name - The normalized tag name to check
	 * @throws Error if name is already taken or empty
	 */
	private async validateUniqueTagName(
		workspaceId: string | undefined,
		name: string,
	): Promise<void> {
		await ValidationUtils.validateUniqueTagName(
			this.repository,
			workspaceId,
			name,
		);
	}
}
