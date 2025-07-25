import type { LucideIcon } from "lucide-vue-next";

/**
 * Configuration interface for sidebar navigation items
 * Supports nested menus, conditional visibility, and access control
 */
export interface AppSidebarItem {
	/** Display title for the navigation item */
	title: string;

	/** Optional URL for navigation - if missing, renders as container/category */
	url?: string;

	/** Optional Lucide icon component */
	icon?: LucideIcon;

	/** Force active state regardless of URL matching */
	isActive?: boolean;

	/** Custom tooltip text (defaults to title when sidebar is collapsed) */
	tooltip?: string;

	/** Control visibility - boolean or function that returns boolean */
	visible?: boolean | (() => boolean);

	/** Access control function - sync or async */
	canAccess?: () => boolean | Promise<boolean>;

	/** Nested submenu items - supports unlimited depth */
	items?: AppSidebarItem[];
}

/**
 * Props interface for the main AppSidebar component
 */
export interface AppSidebarProps {
	/** Array of navigation items to render */
	items: AppSidebarItem[];
}

/**
 * Result type for navigation filtering operations
 */
export interface FilterResult {
	/** Successfully filtered items */
	items: AppSidebarItem[];

	/** Any errors encountered during filtering */
	errors: string[];
}

/**
 * Generic Result type for operations that can succeed or fail
 */
export type Result<T, E = string> =
	| { success: true; data: T }
	| { success: false; error: E };

/**
 * Enhanced navigation item with computed properties for better performance
 */
export interface ComputedAppSidebarItem extends AppSidebarItem {
	/** Computed active state */
	readonly isActiveComputed?: boolean;
	/** Computed visibility state */
	readonly isVisibleComputed?: boolean;
	/** Computed accessibility label */
	readonly ariaLabel?: string;
}

/**
 * Validation result type
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}
