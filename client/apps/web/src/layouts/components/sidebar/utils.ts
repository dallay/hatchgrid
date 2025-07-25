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

// Memoization cache for active state calculations with size limit
const MAX_CACHE_SIZE = 100;
const activeStateCache = new Map<string, boolean>();

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

	// Implement LRU-like cache management
	if (activeStateCache.size >= MAX_CACHE_SIZE) {
		const firstKey = activeStateCache.keys().next().value;
		if (firstKey) {
			activeStateCache.delete(firstKey);
		}
	}

	activeStateCache.set(cacheKey, result);
	return result;
}

// Cache for active parent calculations to avoid repeated computations
const activeParentsCache = new Map<string, string[]>();

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
	// Create a more efficient cache key using a simple hash approach
	const itemsHash = items.map((i) => `${i.title}:${i.url || ""}`).join("|");
	const cacheKey = `${currentRoute}-${itemsHash}`;

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
 */
function isAppSidebarItem(item: unknown): item is AppSidebarItem {
	if (typeof item !== "object" || item === null) {
		return false;
	}

	const obj = item as Record<string, unknown>;

	return (
		"title" in obj &&
		typeof obj.title === "string" &&
		obj.title.trim().length > 0 &&
		(obj.url === undefined || typeof obj.url === "string") &&
		(obj.visible === undefined ||
			typeof obj.visible === "boolean" ||
			typeof obj.visible === "function") &&
		(obj.canAccess === undefined || typeof obj.canAccess === "function") &&
		(obj.isActive === undefined || typeof obj.isActive === "boolean") &&
		(obj.tooltip === undefined || typeof obj.tooltip === "string") &&
		(obj.items === undefined || Array.isArray(obj.items))
	);
}

/**
 * Factory function to create a sidebar item with validation and defaults
 * @param config - Partial configuration for the sidebar item
 * @returns Result with either the created item or validation errors
 */
export function createSidebarItem(
	config: Partial<AppSidebarItem> & { title: string },
): Result<AppSidebarItem> {
	const errors = validateSidebarItem(config as AppSidebarItem);

	if (errors.length > 0) {
		return { success: false, error: errors.join("; ") };
	}

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
		console.error("Navigation items must be an array");
		return false;
	}

	if (items.length === 0) {
		console.warn("Navigation items array is empty");
		return true; // Empty array is technically valid
	}

	// Type guard check
	if (!items.every(isAppSidebarItem)) {
		console.error("All items must be valid AppSidebarItem objects");
		return false;
	}

	const errors = validateSidebarItems(items);
	if (errors.length > 0) {
		console.warn("Navigation configuration issues found:", errors);
		return false;
	}

	return true;
}
