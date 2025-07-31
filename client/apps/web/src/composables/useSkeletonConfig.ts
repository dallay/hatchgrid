/**
 * Composable for consistent skeleton loading configurations
 * across the application
 */
export function useSkeletonConfig() {
  const defaultSkeletonCount = 3;
  const animationClass = 'animate-pulse';

  const getSkeletonProps = (count = defaultSkeletonCount) => ({
    count,
    animationClass,
    accessibilityProps: {
      role: 'status' as const,
      'aria-label': 'Loading content',
      'aria-hidden': 'true',
    },
  });

  return {
    defaultSkeletonCount,
    animationClass,
    getSkeletonProps,
  };
}
