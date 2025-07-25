// Export all types

// Re-export example data for development/testing
export { exampleNavItems } from "./example";
export type { AppSidebarItem, AppSidebarProps } from "./types";

// Export all utility functions
export {
	canAccess,
	clearActiveParentsCache,
	filterNavItems,
	findActiveParents,
	isItemActive,
	isVisible,
	validateNavConfig,
	validateSidebarItem,
	validateSidebarItems,
} from "./utils";
