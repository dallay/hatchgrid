/**
 * Core domain model for Subscriber entity
 * Represents a subscriber in the system with immutable properties
 */
export enum SubscriberStatus {
	ENABLED = "ENABLED",
	DISABLED = "DISABLED",
	BLOCKLISTED = "BLOCKLISTED",
}

/**
 * Dynamic attributes that can be associated with a subscriber
 * Supports various data types for flexible metadata storage
 */
export interface Attributes {
	readonly [key: string]: string | string[] | number | boolean;
}

/**
 * Core subscriber entity representing a user in the system
 * All properties are readonly to enforce immutability in the domain layer
 */
export interface Subscriber {
	/** Unique identifier for the subscriber */
	readonly id: string;
	/** Email address of the subscriber */
	readonly email: string;
	/** Optional display name */
	readonly name?: string;
	/** Current status of the subscriber */
	readonly status: SubscriberStatus;
	/** Optional custom attributes */
	readonly attributes?: Attributes;
	/** ID of the workspace this subscriber belongs to */
	readonly workspaceId: string;
	/** Timestamp when the subscriber was created */
	readonly createdAt?: Date | string;
	/** Timestamp when the subscriber was last updated */
	readonly updatedAt?: Date | string;
}
/**
 * Domain utility functions
 */

/** Check if a subscriber is active (enabled status) */
export const isActiveSubscriber = (subscriber: Subscriber): boolean => {
	return subscriber.status === SubscriberStatus.ENABLED;
};

/** Check if a subscriber is blocked */
export const isBlockedSubscriber = (subscriber: Subscriber): boolean => {
	return subscriber.status === SubscriberStatus.BLOCKLISTED;
};

/** Get display name or fallback to email */
export const getSubscriberDisplayName = (subscriber: Subscriber): string => {
	return subscriber.name ?? subscriber.email;
};
