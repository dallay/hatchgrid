/**
 * Composable for consistent skeleton loading configurations
 * across the application
 *
 * @example
 * ```typescript
 * // Use default configuration
 * const { getSkeletonProps } = useSkeletonConfig();
 * const props = getSkeletonProps(5); // 5 skeleton items
 *
 * // Use custom configuration
 * const { getSkeletonProps } = useSkeletonConfig({
 *   defaultCount: 5,
 *   animationClass: "animate-shimmer",
 *   accessibilityLabel: "Loading workspace data"
 * });
 * const props = getSkeletonProps(); // Uses defaultCount: 5
 * ```
 */

/**
 * Configuration options for skeleton loading
 */
interface SkeletonConfig {
	/**
	 * Default number of skeleton items to display
	 * @default 3
	 */
	defaultCount?: number;
	/**
	 * CSS animation class for skeleton loading effect
	 * @default "animate-pulse"
	 */
	animationClass?: string;
	/**
	 * Accessibility label for screen readers
	 * @default "Loading content"
	 */
	accessibilityLabel?: string;
}

/**
 * Props returned by getSkeletonProps function
 */
interface SkeletonProps {
	count: number;
	animationClass: string;
	accessibilityProps: {
		role: "status";
		"aria-label": string;
		"aria-live": "polite";
	};
}

/**
 * Return type of useSkeletonConfig composable
 */
interface UseSkeletonConfigReturn {
	defaultSkeletonCount: number;
	animationClass: string;
	getSkeletonProps: (count?: number) => SkeletonProps;
}

export function useSkeletonConfig(
	config: SkeletonConfig = {},
): UseSkeletonConfigReturn {
	// Extract configuration with defaults
	const {
		defaultCount = 3,
		animationClass = "animate-pulse",
		accessibilityLabel = "Loading content",
	} = config;

	const defaultSkeletonCount = defaultCount;

	const getSkeletonProps = (count = defaultSkeletonCount): SkeletonProps => ({
		count,
		animationClass,
		accessibilityProps: {
			role: "status" as const,
			"aria-label": accessibilityLabel,
			"aria-live": "polite" as const,
		},
	});

	return {
		defaultSkeletonCount,
		animationClass,
		getSkeletonProps,
	};
}
