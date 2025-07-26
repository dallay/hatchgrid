/**
 * Error boundary composable for sidebar components
 * Provides graceful error handling and recovery mechanisms
 */
import { type ComputedRef, computed, onErrorCaptured, ref } from "vue";
import type { AppSidebarItem } from "../types";

export interface ErrorState {
	hasError: boolean;
	error: Error | null;
	errorInfo: string | null;
	timestamp?: number;
	recoverable?: boolean;
}

export interface ErrorBoundaryOptions {
	maxRetries?: number;
	retryDelay?: number;
	onError?: (error: Error, info?: string) => void;
}

/**
 * Provides error boundary functionality for sidebar components
 */
export function useErrorBoundary(options: ErrorBoundaryOptions = {}) {
	const { maxRetries = 3, retryDelay = 1000, onError } = options;

	const errorState = ref<ErrorState>({
		hasError: false,
		error: null,
		errorInfo: null,
	});

	const retryCount = ref(0);

	const clearError = () => {
		errorState.value = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
		retryCount.value = 0;
	};

	const handleError = (error: Error, info?: string) => {
		const timestamp = Date.now();
		const recoverable = retryCount.value < maxRetries;

		errorState.value = {
			hasError: true,
			error,
			errorInfo: info || null,
			timestamp,
			recoverable,
		};

		// Call custom error handler if provided
		onError?.(error, info);

		if (import.meta.env.DEV) {
			console.error("Sidebar component error:", error);
			if (info) console.error("Error info:", info);
			console.error("Retry count:", retryCount.value);
		}
	};

	const retry = async (): Promise<boolean> => {
		if (retryCount.value >= maxRetries) {
			return false;
		}

		retryCount.value++;

		// Add delay before retry
		if (retryDelay > 0) {
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
		}

		clearError();
		return true;
	};

	// Vue error capture
	onErrorCaptured((error, _instance, info) => {
		handleError(error, info);
		return false; // Prevent error from propagating
	});

	return {
		errorState: computed(() => errorState.value),
		clearError,
		handleError,
		retry,
		canRetry: computed(() => retryCount.value < maxRetries),
	};
}

/**
 * Safe item processing with error recovery
 */
export function useSafeItemProcessing(item: ComputedRef<AppSidebarItem>) {
	const { errorState, handleError } = useErrorBoundary();

	const safeItem = computed(() => {
		try {
			// Validate and sanitize the item
			const processedItem: AppSidebarItem = {
				title: item.value.title?.trim() || "Untitled Item",
				url: item.value.url?.trim() || undefined,
				icon: item.value.icon,
				isActive: Boolean(item.value.isActive),
				tooltip:
					item.value.tooltip?.trim() ||
					item.value.title?.trim() ||
					"Navigation Item",
				visible: item.value.visible ?? true,
				canAccess: item.value.canAccess,
				items: item.value.items?.filter(
					(child) =>
						child &&
						typeof child === "object" &&
						typeof child.title === "string" &&
						child.title.trim().length > 0,
				),
			};

			return processedItem;
		} catch (error) {
			handleError(error as Error, "Failed to process sidebar item");

			// Return a safe fallback item
			return {
				title: "Navigation Item",
				tooltip: "Navigation Item",
				visible: true,
				isActive: false,
			} as AppSidebarItem;
		}
	});

	const safeChildren = computed(() => {
		try {
			// Return the original child objects unmodified
			return safeItem.value.items ? [...safeItem.value.items] : [];
		} catch (error) {
			handleError(error as Error, "Failed to process sidebar children");
			return [];
		}
	});

	return {
		safeItem,
		safeChildren,
		errorState,
	};
}

/**
 * Performance monitoring for development
 */
export function usePerformanceMonitoring(componentName: string) {
	if (!import.meta.env.DEV) {
		return {
			measureRender: (fn: () => void) => fn(),
			logPerformanceMetrics: () => {},
		};
	}

	const MAX_RENDER_SAMPLES = 100; // Prevent memory leaks
	const renderTimes: number[] = [];

	const measureRender = (fn: () => void) => {
		const start = performance.now();
		fn();
		const end = performance.now();
		const renderTime = end - start;

		// Maintain a rolling window of render times
		renderTimes.push(renderTime);
		if (renderTimes.length > MAX_RENDER_SAMPLES) {
			renderTimes.shift();
		}

		// Log slow renders
		if (renderTime > 16) {
			// More than one frame at 60fps
			console.warn(
				`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`,
			);
		}
	};

	const logPerformanceMetrics = () => {
		if (renderTimes.length === 0) return;

		const avgRenderTime =
			renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
		const maxRenderTime = Math.max(...renderTimes);

		console.log(`${componentName} Performance:`, {
			averageRenderTime: `${avgRenderTime.toFixed(2)}ms`,
			maxRenderTime: `${maxRenderTime.toFixed(2)}ms`,
			totalRenders: renderTimes.length,
		});
	};

	return {
		measureRender,
		logPerformanceMetrics,
	};
}
