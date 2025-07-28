import type { SubscriberStatus } from "@/subscribers";

/**
 * Represents the count of subscribers for a specific status.
 *
 * @property count - The number of subscribers with the given status.
 * @property status - The status of the subscribers (e.g., ENABLED, DISABLED).
 */
export interface CountByStatusResponse {
	readonly count: number;
	readonly status: SubscriberStatus;
}

/**
 * Response model for an API endpoint returning subscriber counts grouped by status.
 *
 * @property data - An array of objects, each containing a status and its subscriber count.
 */
export interface SubscriberCountByStatusResponse {
	readonly data: CountByStatusResponse[];
}
