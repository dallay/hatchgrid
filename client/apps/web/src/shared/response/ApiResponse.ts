/**
 * Represents a generic API response structure containing data of any type.
 *
 * @template T - The type of the data items contained in the response.
 * @property {T} data - The data contained in the response, which is of type T.
 * @remarks This interface is used to standardize the structure of API responses across the application.
 * It ensures that every response has a `data` property that holds the relevant information.
 * This is particularly useful for type safety and consistency in handling API responses.
 */
export default interface ApiResponse<T> {
	readonly data: T;
}
