/**
 * Represents the count of subscribers for a specific status.
 *
 * @property count - The number of subscribers with the given status.
 * @property status - The status name (e.g., "active", "inactive").
 */
export interface CountByStatusResponse {
	readonly count: number;
	readonly status: string;
}

/**
 * Response model for an API endpoint returning subscriber counts grouped by status.
 *
 * @property data - An array of objects, each containing a status and its subscriber count.
 */
export interface SubscriberCountByStatusResponse {
	readonly data: CountByStatusResponse[];
}
