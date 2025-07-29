/**
 * Represents a generic API response that contains an array of data items.
 *
 * @template T - The type of the data items in the response.
 * @extends ApiResponse<T>
 * @remarks Inherits the `data` property from ApiResponse<T> containing an array of items.
 */
import type ApiResponse from "./ApiResponse";

export default interface DataResponse<T> extends ApiResponse<T> {}
