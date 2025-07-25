// Main component exports
export { default as AppSidebarItem } from "./AppSidebarItem.vue";
export {
	useAccessibility,
	useKeyboardNavigation,
} from "./composables/useAccessibility";
export {
	useErrorBoundary,
	usePerformanceMonitoring,
	useSafeItemProcessing,
} from "./composables/useErrorBoundary";

// Composable exports
export {
	isValidSidebarItem,
	useItemValidation,
	validateSidebarItem,
} from "./composables/useItemValidation";
// Test utility exports (development only)
export * from "./test-utils";
// Type exports
export * from "./types";
// Utility exports
export * from "./utils";
