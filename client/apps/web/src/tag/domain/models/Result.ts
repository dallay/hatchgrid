/**
 * Result type for better error handling
 * Provides a type-safe way to handle success and error cases
 */

/**
 * Represents a successful operation result
 */
export interface Success<T> {
	readonly success: true;
	readonly data: T;
}

/**
 * Represents a failed operation result
 */
export interface Failure<E = string> {
	readonly success: false;
	readonly error: E;
}

/**
 * Union type representing either success or failure
 */
export type Result<T, E = string> = Success<T> | Failure<E>;

/**
 * Result utility functions
 */
export namespace Result {
	/**
	 * Create a successful result
	 * @param data - The success data
	 * @returns Success result
	 */
	export function success<T>(data: T): Success<T> {
		return { success: true, data };
	}

	/**
	 * Create a failure result
	 * @param error - The error information
	 * @returns Failure result
	 */
	export function failure<E = string>(error: E): Failure<E> {
		return { success: false, error };
	}

	/**
	 * Check if result is successful
	 * @param result - The result to check
	 * @returns Type guard for success
	 */
	export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
		return result.success;
	}

	/**
	 * Check if result is a failure
	 * @param result - The result to check
	 * @returns Type guard for failure
	 */
	export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
		return !result.success;
	}

	/**
	 * Map the success value of a result
	 * @param result - The result to map
	 * @param fn - The mapping function
	 * @returns Mapped result
	 */
	export function map<T, U, E>(
		result: Result<T, E>,
		fn: (data: T) => U,
	): Result<U, E> {
		return isSuccess(result) ? success(fn(result.data)) : result;
	}

	/**
	 * Map the error value of a result
	 * @param result - The result to map
	 * @param fn - The error mapping function
	 * @returns Mapped result
	 */
	export function mapError<T, E, F>(
		result: Result<T, E>,
		fn: (error: E) => F,
	): Result<T, F> {
		return isFailure(result) ? failure(fn(result.error)) : result;
	}

	/**
	 * Chain operations that return Results
	 * @param result - The result to chain
	 * @param fn - The chaining function
	 * @returns Chained result
	 */
	export function flatMap<T, U, E>(
		result: Result<T, E>,
		fn: (data: T) => Result<U, E>,
	): Result<U, E> {
		return isSuccess(result) ? fn(result.data) : result;
	}

	/**
	 * Get the value or throw an error
	 * @param result - The result to unwrap
	 * @returns The success value
	 * @throws Error if result is failure
	 */
	export function unwrap<T, E>(result: Result<T, E>): T {
		if (isSuccess(result)) {
			return result.data;
		}
		throw new Error(
			typeof result.error === "string" ? result.error : "Operation failed",
		);
	}

	/**
	 * Get the value or return a default
	 * @param result - The result to unwrap
	 * @param defaultValue - The default value to return on failure
	 * @returns The success value or default
	 */
	export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
		return isSuccess(result) ? result.data : defaultValue;
	}
}
