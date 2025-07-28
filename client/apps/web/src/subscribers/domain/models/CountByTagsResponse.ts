/**
 * Represents the count of subscribers for a specific tag.
 *
 * @property count - The number of subscribers associated with the tag.
 * @property tag - The tag name.
 */
export interface CountByTagsResponse {
	count: number;
	tag: string;
}

/**
 * Response model for an API endpoint returning subscriber counts grouped by tags.
 *
 * @property data - An array of objects, each containing a tag and its subscriber count.
 */
export interface SubscriberCountByTagsResponse {
	data: CountByTagsResponse[];
}
