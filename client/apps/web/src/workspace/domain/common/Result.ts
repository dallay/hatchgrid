/**
 * Result pattern implementation for better error handling.
 * Provides a type-safe way to handle success and failure cases.
 */

/**
 * Represents a successful operation result.
 */
export interface Success<T> {
	readonly success: true;
	readonly data: T;
}

/**
 * Represents a failed operation result.
 */
export interface Failure<E = Error> {
	readonly success: false;
	readonly error: E;
}

/**
 * Union type representing either success or failure.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Creates a successful result.
 */
export const success = <T>(data: T): Success<T> => ({
	success: true,
	data,
});

/**
 * Creates a failed result.
 */
export const failure = <E = Error>(error: E): Failure<E> => ({
	success: false,
	error,
});

/**
 * Type guard to check if result is successful.
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
	return result.success;
};

/**
 * Type guard to check if result is a failure.
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
	return !result.success;
};

/**
 * Maps a successful result to a new value.
 */
export const mapResult = <T, U, E>(
	result: Result<T, E>,
	mapper: (data: T) => U,
): Result<U, E> => {
	return isSuccess(result) ? success(mapper(result.data)) : result;
};

/**
 * Chains multiple operations that return Results.
 */
export const flatMapResult = <T, U, E>(
	result: Result<T, E>,
	mapper: (data: T) => Result<U, E>,
): Result<U, E> => {
	return isSuccess(result) ? mapper(result.data) : result;
};

/**
 * Wraps a function that might throw into a Result.
 */
export const tryCatch = <T, E = Error>(
	fn: () => T,
	errorMapper?: (error: unknown) => E,
): Result<T, E> => {
	try {
		return success(fn());
	} catch (error) {
		const mappedError = errorMapper ? errorMapper(error) : (error as E);
		return failure(mappedError);
	}
};

/**
 * Wraps an async function that might throw into a Result.
 */
export const tryCatchAsync = async <T, E = Error>(
	fn: () => Promise<T>,
	errorMapper?: (error: unknown) => E,
): Promise<Result<T, E>> => {
	try {
		const data = await fn();
		return success(data);
	} catch (error) {
		const mappedError = errorMapper ? errorMapper(error) : (error as E);
		return failure(mappedError);
	}
};
