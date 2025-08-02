import type ApiResponse from "./ApiResponse";

/**
 * Represents an API response containing a collection (array) of items of type `T`.
 *
 * @template T - The type of the items in the collection.
 * @extends ApiResponse<T[]>
 *
 * @remarks
 * This interface is used for endpoints that return a list or array of resource objects.
 * It extends the base `ApiResponse` interface, specifying that the `data` property is an array of `T`.
 */
export default interface CollectionResponse<T> extends ApiResponse<T[]> {}
