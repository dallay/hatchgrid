/**
 * Domain models exports
 * Centralized export for all domain models and types
 */

export type {
	CountByStatusResponse,
	SubscriberCountByStatusResponse,
} from "./CountByStatusResponse";

export type {
	CountByTagsResponse,
	SubscriberCountByTagsResponse,
} from "./CountByTagsResponse";

export type {
	Attributes,
	Subscriber,
} from "./Subscriber";

export {
	getSubscriberDisplayName,
	isActiveSubscriber,
	SubscriberStatus,
} from "./Subscriber";

export type {
	CountByStatusResponseSchemaType,
	CountByTagsResponseSchemaType,
	SubscriberSchemaType,
} from "./schemas";
export {
	attributesSchema,
	countByStatusArraySchema,
	countByStatusResponseSchema,
	countByTagsArraySchema,
	countByTagsResponseSchema,
	subscriberSchema,
	subscriberStatusSchema,
	subscribersArraySchema,
} from "./schemas";
