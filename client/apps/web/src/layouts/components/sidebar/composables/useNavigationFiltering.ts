/**
 * Navigation filtering composable
 * Handles async filtering of navigation items with error recovery
 */

import { debounce } from "@hatchgrid/utilities";
import { computed, onMounted, ref, watch } from "vue";
import type { AppSidebarItem } from "../types";
import {
	filterNavItems,
	safeProcessNavItems,
	validateNavConfig,
} from "../utils";
import { useErrorBoundary } from "./useErrorBoundary";

export interface NavigationFilteringOptions {
	maxRetries?: number;
	retryDelay?: number;
	onError?: (error: Error, info?: string) => void;
}

export function useNavigationFiltering(
	items: () => AppSidebarItem[],
	options: NavigationFilteringOptions = {},
) {
	const { errorState, handleError, clearError } = useErrorBoundary(options);

	const isLoading = ref(false);
	const filteredItems = ref<AppSidebarItem[]>([]);

	// Validate navigation configuration
	const isValidConfig = computed(() => {
		try {
			return validateNavConfig(items());
		} catch (error) {
			handleError(error as Error, "Navigation configuration validation failed");
			return false;
		}
	});

	// Safe processing of navigation items with error recovery
	const safeItems = computed(() => {
		if (!isValidConfig.value) {
			return [];
		}

		try {
			return safeProcessNavItems(items());
		} catch (error) {
			handleError(error as Error, "Failed to process navigation items");
			return [];
		}
	});

	// Filter navigation items based on visibility and access control
	const filterItems = async () => {
		if (!safeItems.value.length) {
			filteredItems.value = [];
			return;
		}

		try {
			isLoading.value = true;
			clearError();

			const startTime = performance.now();
			const filtered = await filterNavItems(safeItems.value);

			// Performance monitoring in development
			if (import.meta.env.DEV) {
				const duration = performance.now() - startTime;
				if (duration > 100) {
					// Log if filtering takes more than 100ms
					console.warn(
						`Navigation filtering took ${duration.toFixed(2)}ms for ${safeItems.value.length} items`,
					);
				}
			}

			filteredItems.value = filtered;
		} catch (error) {
			handleError(error as Error, "Failed to filter navigation items");
			// Fallback to unfiltered items if filtering fails
			filteredItems.value = safeItems.value;
		} finally {
			isLoading.value = false;
		}
	};

	// Debounced filter function
	const debouncedFilterItems = debounce(filterItems, 300);

	// Watch with debounced handler
	watch(items, debouncedFilterItems, { deep: true });

	// Initial filtering on mount
	onMounted(filterItems);

	// Computed property to determine if we should show loading state
	const shouldShowLoading = computed(() => {
		return isLoading.value && filteredItems.value.length === 0;
	});

	// Computed property for error display
	const shouldShowError = computed(() => {
		return errorState.value.hasError && !errorState.value.recoverable;
	});

	return {
		filteredItems: computed(() => filteredItems.value),
		isLoading: computed(() => isLoading.value),
		shouldShowLoading,
		shouldShowError,
		errorState,
		filterItems,
		clearError,
	};
}
