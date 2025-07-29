/**
 * Represents a paginated response that extends {@link CollectionResponse} with cursor-based pagination.
 *
 * @template T - The type of the data contained in the response.
 * @extends CollectionResponse<T>
 *
 * @property {string | undefined | null} prevPageCursor - The cursor for the previous page, if available.
 * @property {string | undefined | null} nextPageCursor - The cursor for the next page, if available.
 */
import type CollectionResponse from "./CollectionResponse.ts";

export default interface PageResponse<T> extends CollectionResponse<T> {
	readonly prevPageCursor: string | undefined | null;
	readonly nextPageCursor: string | undefined | null;
}
