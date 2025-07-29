/**
 * Represents a generic API response structure containing an array of data items.
 *
 * @template T - The type of the data items contained in the response.
 * @property {T[]} data - The array of data items returned by the API.
 */
export default interface ApiResponse<T> {
	readonly data: T[];
}
