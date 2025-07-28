import { z } from "zod";
import { type Subscriber, SubscriberStatus } from "@/subscribers";
/**
 * Zod schema for validating the `SubscriberStatus` enum.
 */
export const subscriberStatusSchema = z.enum(SubscriberStatus);
/**
 * Zod schema for validating subscriber attributes.
 * Accepts a record with string keys and values of type string, string array, number, or boolean.
 */
export const attributesSchema = z.record(
	z.string(),
	z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]),
);
/**
 * Zod schema for validating a `Subscriber` object.
 * Fields:
 * - id: UUID string
 * - email: valid email string
 * - name: optional string
 * - status: must match `SubscriberStatus`
 * - attributes: optional record of attributes
 * - workspaceId: UUID string
 * - createdAt: optional Date or ISO datetime string
 * - updatedAt: optional Date or ISO datetime string
 */
export const subscriberSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string().optional(),
	status: subscriberStatusSchema,
	attributes: attributesSchema.optional(),
	workspaceId: z.uuid(),
	createdAt: z.union([z.date(), z.iso.datetime()]).optional(),
	updatedAt: z.union([z.date(), z.iso.datetime()]).optional(),
});

/**
 * Zod schema for validating the response of subscriber count by status.
 * Fields:
 * - count: non-negative integer
 * - status: must match `SubscriberStatus`
 */
export const countByStatusResponseSchema = z.object({
	count: z.number().int().min(0),
	status: subscriberStatusSchema,
});

/**
 * Zod schema for validating the response of subscriber count by tag.
 * Fields:
 * - count: non-negative integer
 * - tag: string
 */
export const countByTagsResponseSchema = z.object({
	count: z.number().int().min(0),
	tag: z.string(),
});
/**
 * Type representing a validated subscriber, inferred from `subscriberSchema`.
 */
export type SubscriberValidated = z.infer<typeof subscriberSchema>;
/**
 * Validates the provided data against the `subscriberSchema`.
 * @param data - The data to validate.
 * @returns The validated `Subscriber` object.
 * @throws ZodError if validation fails.
 */
export const validateSubscriber = (data: unknown): Subscriber => {
	return subscriberSchema.parse(data);
};

/**
 * Safely validates the provided data against the `subscriberSchema`.
 * @param data - The data to validate.
 * @returns The result of `subscriberSchema.safeParse`, containing either the validated data or validation errors.
 */
export const safeValidateSubscriber = (
	data: unknown,
): ReturnType<typeof subscriberSchema.safeParse> => {
	return subscriberSchema.safeParse(data);
};
