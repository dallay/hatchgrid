/**
 * Accessibility composable for sidebar components
 * Provides ARIA attributes and keyboard navigation support
 */
import { type ComputedRef, computed } from "vue";
import type { AppSidebarItem } from "../types";

export interface AccessibilityOptions {
	level?: number;
	isExpanded?: boolean;
	hasChildren?: boolean;
}

/**
 * Provides accessibility features for sidebar items
 */
export function useAccessibility(
	item: ComputedRef<AppSidebarItem>,
	options: ComputedRef<AccessibilityOptions> = computed(() => ({})),
) {
	const { level = 0, isExpanded = false, hasChildren = false } = options.value;

	// Generate appropriate ARIA label
	const ariaLabel = computed(() => {
		const title = item.value.title || "Navigation Item";

		if (!hasChildren) {
			return title;
		}

		const menuType = level === 0 ? "menu" : "submenu";
		const expandedState = isExpanded ? "expanded" : "collapsed";
		return `${title} ${menuType}, ${expandedState}`;
	});

	// Determine appropriate role
	const role = computed(() => {
		if (hasChildren) return "button";
		return item.value.url ? "link" : "button";
	});

	// Generate tooltip text with fallback
	const tooltipText = computed(() => {
		return item.value.tooltip || item.value.title || "Navigation Item";
	});

	// ARIA attributes for expanded state
	const ariaExpanded = computed(() => {
		return hasChildren ? isExpanded : undefined;
	});

	// ARIA attributes for hierarchical navigation
	const ariaLevel = computed(() => {
		return level > 0 ? level + 1 : undefined;
	});

	// Check if item has valid navigation target
	const hasValidTarget = computed(() => {
		return Boolean(item.value.url?.trim());
	});

	return {
		ariaLabel,
		role,
		tooltipText,
		ariaExpanded,
		ariaLevel,
		hasValidTarget,
	};
}

/**
 * Keyboard navigation handler for sidebar items
 */
export function useKeyboardNavigation() {
	const handleKeyDown = (
		event: KeyboardEvent,
		callbacks: {
			onEnter?: () => void;
			onSpace?: () => void;
			onArrowRight?: () => void;
			onArrowLeft?: () => void;
			onArrowDown?: () => void;
			onArrowUp?: () => void;
		},
	) => {
		switch (event.key) {
			case "Enter":
				event.preventDefault();
				callbacks.onEnter?.();
				break;
			case " ":
				event.preventDefault();
				callbacks.onSpace?.();
				break;
			case "ArrowRight":
				event.preventDefault();
				callbacks.onArrowRight?.();
				break;
			case "ArrowLeft":
				event.preventDefault();
				callbacks.onArrowLeft?.();
				break;
			case "ArrowDown":
				event.preventDefault();
				callbacks.onArrowDown?.();
				break;
			case "ArrowUp":
				event.preventDefault();
				callbacks.onArrowUp?.();
				break;
		}
	};

	return {
		handleKeyDown,
	};
}
