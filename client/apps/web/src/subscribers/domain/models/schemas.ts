/**
 * Zod validation schemas for domain models
 * Provides runtime validation for subscriber-related data
 */

import { z } from "zod";
import { SubscriberStatus } from "./Subscriber";

/**
 * Schema for subscriber attributes
 * Allows flexible key-value pairs with various data types
 */
export const attributesSchema = z
	.record(
		z.string(),
		z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]),
	)
	.optional();

/**
 * Schema for subscriber status enum
 */
export const subscriberStatusSchema = z.nativeEnum(SubscriberStatus);

/**
 * Core subscriber schema with validation rules
 */
export const subscriberSchema = z
	.object({
		id: z.string().uuid("Invalid subscriber ID format"),
		email: z.string().email("Invalid email format"),
		name: z.string().optional(),
		status: subscriberStatusSchema,
		attributes: attributesSchema,
		workspaceId: z.string().uuid("Invalid workspace ID format"),
		createdAt: z.union([z.date(), z.string().datetime()]).optional(),
		updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
	})
	.readonly();

/**
 * Schema for count by status response
 */
export const countByStatusResponseSchema = z
	.object({
		count: z.number().int().min(0, "Count must be non-negative"),
		status: z.string().min(1, "Status cannot be empty"),
	})
	.readonly();

/**
 * Schema for count by tags response
 */
export const countByTagsResponseSchema = z
	.object({
		count: z.number().int().min(0, "Count must be non-negative"),
		tag: z.string().min(1, "Tag cannot be empty"),
	})
	.readonly();

/**
 * Array schemas for bulk operations
 */
export const subscribersArraySchema = z.array(subscriberSchema);
export const countByStatusArraySchema = z.array(countByStatusResponseSchema);
export const countByTagsArraySchema = z.array(countByTagsResponseSchema);

/**
 * Type inference from schemas
 */
export type SubscriberSchemaType = z.infer<typeof subscriberSchema>;
export type CountByStatusResponseSchemaType = z.infer<
	typeof countByStatusResponseSchema
>;
export type CountByTagsResponseSchemaType = z.infer<
	typeof countByTagsResponseSchema
>;
