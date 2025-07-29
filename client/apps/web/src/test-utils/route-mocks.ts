import type {
	RouteLocationNormalized,
	RouteLocationNormalizedLoaded,
} from "vue-router";

/**
 * Creates a mock RouteLocationNormalized object for testing
 */
export const createMockRoute = (
	path: string,
	options: {
		meta?: Record<string, unknown>;
		query?: Record<string, string>;
		params?: Record<string, string>;
	} = {},
): RouteLocationNormalized => ({
	path,
	fullPath: path,
	name: undefined,
	params: options.params || {},
	query: options.query || {},
	hash: "",
	matched: [],
	redirectedFrom: undefined,
	meta: options.meta || {},
});

/**
 * Creates a mock RouteLocationNormalizedLoaded object for testing
 */
export const createMockRouteLoaded = (
	options: {
		path?: string;
		meta?: Record<string, unknown>;
		query?: Record<string, string>;
		params?: Record<string, string>;
	} = {},
): RouteLocationNormalizedLoaded => ({
	path: options.path || "/",
	fullPath: options.path || "/",
	name: undefined,
	params: options.params || {},
	query: options.query || {},
	hash: "",
	matched: [],
	redirectedFrom: undefined,
	meta: options.meta || {},
});
