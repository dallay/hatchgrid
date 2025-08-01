import { LRUCache } from "@/cache/lru.cache";
import type { AppSidebarItem, Result } from "./types";

/**
 * Checks if a sidebar item should be visible
 * @param item - The sidebar item to check
 * @returns true if the item should be visible
 */
export function isVisible(item: AppSidebarItem): boolean {
	if (typeof item.visible === "function") {
		return item.visible();
	}
	return item.visible !== false;
}

/**
 * Checks if a user can access a sidebar item
 * @param item - The sidebar item to check
 * @returns Promise<boolean> indicating access permission
 */
export async function canAccess(item: AppSidebarItem): Promise<boolean> {
	if (!item.canAccess) {
		return true;
	}

	try {
		const result = item.canAccess();
		return typeof result === "boolean" ? result : await result;
	} catch (error) {
		console.warn(
			`Access control check failed for item "${item.title}":`,
			error instanceof Error ? error.message : String(error),
		);
		return false;
	}
}

/**
 * Recursively filters navigation items based on visibility and access control
 * Uses Promise.all for parallel access control checks to improve performance
 * @param items - Array of sidebar items to filter
 * @returns Promise<AppSidebarItem[]> with filtered items
 */
export async function filterNavItems(
	items: readonly AppSidebarItem[],
): Promise<AppSidebarItem[]> {
	// Filter visible items first (synchronous)
	const visibleItems = items.filter(isVisible);

	// Check access control for all visible items in parallel
	const accessResults = await Promise.all(
		visibleItems.map((item) => canAccess(item)),
	);

	const accessibleItems = visibleItems.filter(
		(_, index) => accessResults[index],
	);

	// Process children recursively
	const results: AppSidebarItem[] = [];

	for (const item of accessibleItems) {
		// Recursively filter children if they exist
		const children = item.items ? await filterNavItems(item.items) : undefined;

		// Only include parent if it has children or is a leaf node
		if (!item.items || (children && children.length > 0)) {
			results.push({
				...item,
				items: children,
			});
		}
	}

	return results;
}

const activeStateCache = new LRUCache<boolean>({
	maxSize: 100,
	ttl: 5 * 60 * 1000,
});

/**
 * Checks if a sidebar item or any of its children is active
 * Uses memoization to improve performance for repeated calls
 * @param item - The sidebar item to check
 * @param currentRoute - The current route path
 * @returns true if the item or any child is active
 */
export function isItemActive(
	item: AppSidebarItem,
	currentRoute: string,
): boolean {
	// Create cache key for memoization
	const cacheKey = `${item.title}-${item.url || ""}-${currentRoute}`;
	const cachedResult = activeStateCache.get(cacheKey);

	if (cachedResult !== undefined) {
		return cachedResult;
	}

	let result = false;

	// Check explicit active flag first
	if (item.isActive) {
		result = true;
	}
	// Check if current item's URL matches the route
	else if (item.url && currentRoute === item.url) {
		result = true;
	}
	// Recursively check children
	else {
		result =
			item.items?.some((child) => isItemActive(child, currentRoute)) ?? false;
	}

	activeStateCache.set(cacheKey, result);
	return result;
}

const activeParentsCache = new LRUCache<string[]>({
	maxSize: 50,
	ttl: 5 * 60 * 1000,
});

/**
 * Stable JSON stringify for objects/arrays (order-insensitive for keys)
 */
function stableStringify(obj: unknown): string {
	if (Array.isArray(obj)) {
		return `[${obj.map(stableStringify).join(",")}]`;
	}
	if (obj && typeof obj === "object") {
		const record = obj as Record<string, unknown>;
		const keys = Object.keys(record).sort();
		return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`).join(",")}}`;
	}
	return JSON.stringify(obj);
}

/**
 * Simple hash function for strings (djb2)
 */
function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) + hash + str.charCodeAt(i);
	}
	return hash >>> 0;
}

/**
 * Finds all parent items that contain an active child
 * Used for auto-expanding parent menus
 * Uses caching to improve performance for repeated calls
 * @param items - Array of sidebar items to search
 * @param currentRoute - The current route path
 * @returns Array of item titles that should be expanded
 */
export function findActiveParents(
	items: readonly AppSidebarItem[],
	currentRoute: string,
): string[] {
	// Generate a robust cache key based on the navigation structure and currentRoute
	// This ensures cache invalidation when navigation data changes
	const navStructure = stableStringify(items);
	const cacheKey = `${currentRoute}-${hashString(navStructure)}`;

	const cachedResult = activeParentsCache.get(cacheKey);
	if (cachedResult) {
		return cachedResult;
	}

	const activeParents: string[] = [];

	const findActiveParentsRecursive = (
		itemsToCheck: readonly AppSidebarItem[],
		parentPath: string[] = [],
	): boolean => {
		let hasActiveChild = false;

		for (const item of itemsToCheck) {
			if (item.items) {
				const currentPath = [...parentPath, item.title];
				const childHasActive = findActiveParentsRecursive(
					item.items,
					currentPath,
				);

				if (childHasActive) {
					activeParents.push(...currentPath);
					hasActiveChild = true;
				}
			}

			// Check if current item is active
			if (isItemActive(item, currentRoute)) {
				hasActiveChild = true;
			}
		}

		return hasActiveChild;
	};

	findActiveParentsRecursive(items);

	// Remove duplicates while preserving order
	const uniqueActiveParents = [...new Set(activeParents)];

	activeParentsCache.set(cacheKey, uniqueActiveParents);
	return uniqueActiveParents;
}

/**
 * Clears the active parents cache
 * Should be called when navigation structure changes
 */
export function clearActiveParentsCache(): void {
	activeParentsCache.clear();
	activeStateCache.clear();
}

/**
 * Validates a sidebar item configuration
 * @param item - The sidebar item to validate
 * @returns Array of validation error messages
 */
export function validateSidebarItem(item: AppSidebarItem): string[] {
	const errors: string[] = [];

	if (!item.title || item.title.trim().length === 0) {
		errors.push("Item title is required and cannot be empty");
	}

	if (item.url && !item.url.startsWith("/") && !item.url.startsWith("http")) {
		errors.push(
			`Invalid URL format: "${item.url}". URLs should start with "/" or "http"`,
		);
	}

	if (item.items) {
		for (const [index, child] of item.items.entries()) {
			const childErrors = validateSidebarItem(child);
			errors.push(
				...childErrors.map((error) => `Child item ${index}: ${error}`),
			);
		}
	}

	return errors;
}

/**
 * Validates an array of sidebar items
 * @param items - Array of sidebar items to validate
 * @returns Array of validation error messages
 */
export function validateSidebarItems(
	items: readonly AppSidebarItem[],
): string[] {
	const errors: string[] = [];

	for (const [index, item] of items.entries()) {
		const itemErrors = validateSidebarItem(item);
		errors.push(
			...itemErrors.map((error) => `Item ${index} (${item.title}): ${error}`),
		);
	}

	return errors;
}

/**
 * Type guard to check if an object is a valid AppSidebarItem
 * Enhanced with better validation and error reporting
 */
function isAppSidebarItem(item: unknown): item is AppSidebarItem {
	if (typeof item !== "object" || item === null) {
		return false;
	}

	const obj = item as Record<string, unknown>;

	// Required fields validation
	if (
		!("title" in obj) ||
		typeof obj.title !== "string" ||
		obj.title.trim().length === 0
	) {
		return false;
	}

	// Enhanced optional field validations with better type checking
	const validations: Array<{ check: boolean; field: string }> = [
		{
			check:
				obj.url === undefined ||
				(typeof obj.url === "string" && obj.url.length > 0),
			field: "url",
		},
		{
			check:
				obj.visible === undefined ||
				typeof obj.visible === "boolean" ||
				typeof obj.visible === "function",
			field: "visible",
		},
		{
			check: obj.canAccess === undefined || typeof obj.canAccess === "function",
			field: "canAccess",
		},
		{
			check: obj.isActive === undefined || typeof obj.isActive === "boolean",
			field: "isActive",
		},
		{
			check:
				obj.tooltip === undefined ||
				(typeof obj.tooltip === "string" && obj.tooltip.length >= 0),
			field: "tooltip",
		},
		{
			check:
				obj.icon === undefined ||
				(typeof obj.icon === "object" && obj.icon !== null) ||
				typeof obj.icon === "function",
			field: "icon",
		},
		{
			check: obj.items === undefined || Array.isArray(obj.items),
			field: "items",
		},
	];

	const failedValidation = validations.find((v) => !v.check);
	if (failedValidation && import.meta.env.DEV) {
		console.warn(
			`Invalid AppSidebarItem: field '${failedValidation.field}' failed validation`,
		);
	}

	return validations.every((v) => v.check);
}

/**
 * Factory function to create a sidebar item with validation and defaults
 * @param config - Partial configuration for the sidebar item
 * @returns Result with either the created item or validation errors
 */
export function createSidebarItem(
	config: Partial<AppSidebarItem> & { title: string },
): Result<AppSidebarItem> {
	// Create a full object with defaults for missing fields
	const item: AppSidebarItem = {
		title: config.title,
		url: config.url,
		icon: config.icon,
		isActive: config.isActive ?? false,
		tooltip: config.tooltip ?? config.title,
		visible: config.visible ?? true,
		canAccess: config.canAccess,
		items: config.items,
	};

	const errors = validateSidebarItem(item);

	if (errors.length > 0) {
		return { success: false, error: errors.join("; ") };
	}

	return { success: true, data: item };
}

/**
 * Validates navigation configuration with runtime checks
 * Logs warnings and errors to console for development feedback
 * @param items - Navigation items to validate
 * @returns boolean indicating if configuration is valid
 */
export function validateNavConfig(items: unknown): items is AppSidebarItem[] {
	if (!Array.isArray(items)) {
		if (import.meta.env.DEV) {
			console.error("Navigation items must be an array");
		}
		return false;
	}

	if (items.length === 0) {
		if (import.meta.env.DEV) {
			console.warn("Navigation items array is empty");
		}
		return true; // Empty array is technically valid
	}

	// Type guard check
	if (!items.every(isAppSidebarItem)) {
		if (import.meta.env.DEV) {
			console.error("All items must be valid AppSidebarItem objects");
		}
		return false;
	}

	const errors = validateSidebarItems(items);
	if (errors.length > 0) {
		if (import.meta.env.DEV) {
			console.warn("Navigation configuration issues found:", errors);
		}
		return false;
	}

	return true;
}

/**
 * Enhanced error boundary for navigation item processing
 * Provides graceful degradation when items are malformed
 */
export function safeProcessNavItems(items: unknown): AppSidebarItem[] {
	if (!Array.isArray(items)) {
		if (import.meta.env.DEV) {
			console.warn("Expected array of navigation items, got:", typeof items);
		}
		return [];
	}

	return items
		.filter((item): item is AppSidebarItem => {
			// More robust validation using type guard
			if (!isAppSidebarItem(item)) {
				if (import.meta.env.DEV) {
					console.warn("Filtering out invalid navigation item:", item);
				}
				return false;
			}

			// Validate URL format if provided
			if (item.url && typeof item.url === "string") {
				const urlPattern = /^(\/|https?:\/\/)/;
				if (!urlPattern.test(item.url)) {
					if (import.meta.env.DEV) {
						console.warn(
							`Invalid URL format for item "${item.title}": ${item.url}`,
						);
					}
					// Don't filter out, just log warning
				}
			}

			return true;
		})
		.map((item) => ({
			...item,
			// Ensure title is always a string
			title: item.title.trim(),
			// Recursively process children
			items: item.items ? safeProcessNavItems(item.items) : undefined,
		}));
}

/**
 * Performance monitoring utility for development
 * Measures navigation processing time and cache efficiency
 */
export function measureNavigationPerformance<T>(
	operation: () => T,
	operationName: string,
): T {
	if (!import.meta.env.DEV) {
		return operation();
	}

	const startTime = performance.now();
	const result = operation();
	const endTime = performance.now();
	const duration = endTime - startTime;

	// Collect performance metrics
	if (typeof window !== "undefined" && "performance" in window) {
		// Use Performance Observer API if available
		try {
			performance.mark(`sidebar-${operationName}-start`);
			performance.mark(`sidebar-${operationName}-end`);
			performance.measure(
				`sidebar-${operationName}`,
				`sidebar-${operationName}-start`,
				`sidebar-${operationName}-end`,
			);
		} catch (_error) {
			// Fallback to console logging
			if (duration > 10) {
				console.warn(
					`Navigation operation "${operationName}" took ${duration.toFixed(2)}ms`,
				);
			}
		}
	}

	// Log slow operations
	if (duration > 16) {
		// More than one frame at 60fps
		console.warn(
			`Slow navigation operation "${operationName}": ${duration.toFixed(2)}ms`,
		);
	}

	return result;
}

/**
 * Debounced cache clearing for better performance
 */

/**
 * Debounced cache clearing for better performance and SSR/component safety
 * Returns a cleanup function to cancel the timeout if needed
 * Uses a shared timeout for true debouncing (module-level, SSR-safe)
 */
let debouncedCacheTimeout: ReturnType<typeof setTimeout> | null = null;
export function debouncedClearCache(delay = 1000): () => void {
	if (debouncedCacheTimeout) {
		clearTimeout(debouncedCacheTimeout);
	}
	debouncedCacheTimeout = setTimeout(() => {
		clearActiveParentsCache();
		debouncedCacheTimeout = null;
	}, delay);
	// Return cleanup function
	return () => {
		if (debouncedCacheTimeout) {
			clearTimeout(debouncedCacheTimeout);
			debouncedCacheTimeout = null;
		}
	};
}
