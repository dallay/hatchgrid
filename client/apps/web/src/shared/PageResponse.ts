/**
 * Represents a paginated response that extends {@link DataResponse} with cursor-based pagination.
 *
 * @template T - The type of the data contained in the response.
 * @extends DataResponse<T>
 *
 * @property {string | undefined | null} prevPageCursor - The cursor for the previous page, if available.
 * @property {string | undefined | null} nextPageCursor - The cursor for the next page, if available.
 */
import type DataResponse from "./DataResponse.ts";

export default interface PageResponse<T> extends DataResponse<T> {
	readonly prevPageCursor: string | undefined | null;
	readonly nextPageCursor: string | undefined | null;
}
