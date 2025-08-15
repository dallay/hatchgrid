/**
 * Zod validation schemas for tag domain models
 * Provides runtime validation for tag-related data
 */

import { z } from "zod";
import { TagColors } from "./TagColors.ts";

/**
 * Validation constants
 */
export const TAG_VALIDATION_CONSTANTS = {
	NAME_MIN_LENGTH: 1,
	NAME_MAX_LENGTH: 50,
} as const;

/**
 * Common validation patterns
 */
const tagNameValidation = z
	.string()
	.min(TAG_VALIDATION_CONSTANTS.NAME_MIN_LENGTH, "tag.validation.name.empty")
	.max(TAG_VALIDATION_CONSTANTS.NAME_MAX_LENGTH, "tag.validation.name.tooLong");

const uuidValidation = z.uuid("tag.validation.id.invalid");

const subscribersValidation = z.union([
	z.array(z.string().uuid("tag.validation.subscriber.invalidId")),
	z.string().regex(/^\d+$/, "tag.validation.subscriber.invalidCount"),
]);

/**
 * Schema for tag colors enum
 */
export const tagColorsSchema = z.nativeEnum(TagColors);

/**
 * Core tag schema with validation rules
 */
export const tagSchema = z
	.object({
		id: uuidValidation,
		name: tagNameValidation,
		color: tagColorsSchema,
		subscribers: subscribersValidation,
		createdAt: z.union([z.date(), z.string().datetime()]).optional(),
		updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
	})
	.readonly();

/**
 * Schema for tag response from API
 */
export const tagResponseSchema = z
	.object({
		id: uuidValidation,
		name: tagNameValidation,
		color: tagColorsSchema,
		subscribers: subscribersValidation,
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
	})
	.readonly();

/**
 * Schema for creating a new tag
 */
export const createTagRequestSchema = z
	.object({
		name: tagNameValidation,
		color: tagColorsSchema,
	})
	.readonly();

/**
 * Schema for updating an existing tag
 */
export const updateTagRequestSchema = z
	.object({
		name: tagNameValidation.optional(),
		color: tagColorsSchema.optional(),
	})
	.readonly();

/**
 * Array schemas for bulk operations
 */
export const tagsArraySchema = z.array(tagSchema);
export const tagResponsesArraySchema = z.array(tagResponseSchema);

/**
 * Schema transformation utilities
 */

/**
 * Parse and validate tag data, throws on validation error
 * @param data - Unknown data to validate as Tag
 * @returns Validated Tag object
 * @throws ZodError if validation fails
 */
export const parseTag = (data: unknown) => tagSchema.parse(data);

/**
 * Parse and validate tag response data, throws on validation error
 * @param data - Unknown data to validate as TagResponse
 * @returns Validated TagResponse object
 * @throws ZodError if validation fails
 */
export const parseTagResponse = (data: unknown) =>
	tagResponseSchema.parse(data);

/**
 * Parse and validate create tag request data, throws on validation error
 * @param data - Unknown data to validate as CreateTagRequest
 * @returns Validated CreateTagRequest object
 * @throws ZodError if validation fails
 */
export const parseCreateTagRequest = (data: unknown) =>
	createTagRequestSchema.parse(data);

/**
 * Parse and validate update tag request data, throws on validation error
 * @param data - Unknown data to validate as UpdateTagRequest
 * @returns Validated UpdateTagRequest object
 * @throws ZodError if validation fails
 */
export const parseUpdateTagRequest = (data: unknown) =>
	updateTagRequestSchema.parse(data);

/**
 * Safely parse tag data without throwing
 * @param data - Unknown data to validate as Tag
 * @returns SafeParseReturnType with success/error information
 */
export const safeParseTag = (data: unknown) => tagSchema.safeParse(data);

/**
 * Safely parse tag response data without throwing
 * @param data - Unknown data to validate as TagResponse
 * @returns SafeParseReturnType with success/error information
 */
export const safeParseTagResponse = (data: unknown) =>
	tagResponseSchema.safeParse(data);

/**
 * Type inference from schemas
 */
export type TagSchemaType = z.infer<typeof tagSchema>;
export type TagResponseSchemaType = z.infer<typeof tagResponseSchema>;
export type CreateTagRequestSchemaType = z.infer<typeof createTagRequestSchema>;
export type UpdateTagRequestSchemaType = z.infer<typeof updateTagRequestSchema>;
