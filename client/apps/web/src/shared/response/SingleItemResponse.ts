import type ApiResponse from "./ApiResponse.ts";

/**
 * Represents an API response containing a single item of type `T`.
 *
 * @template T - The type of the item returned in the response.
 * @extends ApiResponse<T>
 *
 * @remarks
 * This interface is used for endpoints that return a single resource object.
 * It extends the base `ApiResponse` interface, specifying that the `data` property is of type `T`.
 *
 * @example
 * // Example usage:
 * const response: SingleItemResponse<User> = {
 *   data: { id: "123", name: "Alice" }
 * };
 */
export default interface SingleItemResponse<T> extends ApiResponse<T> {}
