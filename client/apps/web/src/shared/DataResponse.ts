/**
 * Represents a generic API response that contains an array of data items.
 *
 * @template T - The type of the data items in the response.
 * @extends ApiResponse<T>
 * @property {readonly T[]} data - The array of data items returned by the API.
 */
import type ApiResponse from "./ApiResponse";

export default interface DataResponse<T> extends ApiResponse<T> {}
