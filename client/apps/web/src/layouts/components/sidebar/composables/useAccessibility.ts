/**
 * Composable for enhanced accessibility features in sidebar navigation
 * Provides ARIA attributes, keyboard navigation, and screen reader support
 */
import { type ComputedRef, computed } from "vue";
import type { AppSidebarItem } from "../types";

export interface AccessibilityAttributes {
	role: string;
	ariaLabel: string;
	ariaExpanded?: boolean;
	ariaHasPopup?: boolean;
	tabIndex?: number;
}

/**
 * Generates comprehensive accessibility attributes for sidebar items
 */
export function useAccessibility(
	item: ComputedRef<AppSidebarItem>,
	level: ComputedRef<number>,
	hasChildren: ComputedRef<boolean>,
	isActive: ComputedRef<boolean>,
) {
	const role = computed(() => {
		if (hasChildren.value) return "button";
		return item.value.url ? "link" : "button";
	});

	const ariaLabel = computed(() => {
		const title = item.value.title || "Navigation Item";

		if (!hasChildren.value) {
			// Simple item - just return the title with context
			return level.value === 0 ? title : `${title} (submenu item)`;
		}

		// Collapsible item - provide state information
		const menuType = level.value === 0 ? "menu" : "submenu";
		const expandedState = isActive.value ? "expanded" : "collapsed";
		const childCount = item.value.items?.length || 0;

		return `${title} ${menuType}, ${expandedState}, ${childCount} item${childCount !== 1 ? "s" : ""}`;
	});

	const ariaExpanded = computed(() => {
		return hasChildren.value ? isActive.value : undefined;
	});

	const ariaHasPopup = computed(() => {
		return hasChildren.value ? true : undefined;
	});

	const tabIndex = computed(() => {
		// Ensure keyboard navigation works properly
		return 0;
	});

	const accessibilityAttributes = computed<AccessibilityAttributes>(() => ({
		role: role.value,
		ariaLabel: ariaLabel.value,
		ariaExpanded: ariaExpanded.value,
		ariaHasPopup: ariaHasPopup.value,
		tabIndex: tabIndex.value,
	}));

	return {
		role,
		ariaLabel,
		ariaExpanded,
		ariaHasPopup,
		tabIndex,
		accessibilityAttributes,
	};
}

/**
 * Keyboard navigation handler for sidebar items
 */
export function useKeyboardNavigation() {
	const handleKeyDown = (
		event: KeyboardEvent,
		hasChildren: boolean,
		toggleExpanded?: () => void,
	) => {
		switch (event.key) {
			case "Enter":
			case " ":
				event.preventDefault();
				if (hasChildren && toggleExpanded) {
					toggleExpanded();
				}
				break;

			case "ArrowRight":
				if (hasChildren && toggleExpanded) {
					event.preventDefault();
					toggleExpanded();
				}
				break;

			case "ArrowLeft":
				if (hasChildren && toggleExpanded) {
					event.preventDefault();
					toggleExpanded();
				}
				break;

			case "Escape":
				// Close any open menus and return focus to parent
				event.preventDefault();
				(event.target as HTMLElement)?.blur();
				break;
		}
	};

	return {
		handleKeyDown,
	};
}
