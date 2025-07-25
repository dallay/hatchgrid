/**
 * Item validation composable
 * Provides validation and sanitization for sidebar items
 */
import { type ComputedRef, computed } from "vue";
import type { AppSidebarItem, ValidationResult } from "../types";

/**
 * Validates and sanitizes a sidebar item
 */
export function useItemValidation(item: ComputedRef<AppSidebarItem>) {
	// Validate item structure
	const validationResult = computed((): ValidationResult => {
		const errors: string[] = [];
		const currentItem = item.value;

		// Required field validation
		if (!currentItem.title || typeof currentItem.title !== "string") {
			errors.push("Title is required and must be a string");
		} else if (currentItem.title.trim().length === 0) {
			errors.push("Title cannot be empty");
		}

		// Optional field validation
		if (currentItem.url !== undefined) {
			if (typeof currentItem.url !== "string") {
				errors.push("URL must be a string");
			} else if (currentItem.url.trim().length === 0) {
				errors.push("URL cannot be empty");
			} else if (
				!currentItem.url.startsWith("/") &&
				!currentItem.url.startsWith("http")
			) {
				errors.push("URL should start with '/' or 'http'");
			}
		}

		if (
			currentItem.tooltip !== undefined &&
			typeof currentItem.tooltip !== "string"
		) {
			errors.push("Tooltip must be a string");
		}

		if (
			currentItem.isActive !== undefined &&
			typeof currentItem.isActive !== "boolean"
		) {
			errors.push("isActive must be a boolean");
		}

		if (currentItem.visible !== undefined) {
			const isValidVisible =
				typeof currentItem.visible === "boolean" ||
				typeof currentItem.visible === "function";

			if (!isValidVisible) {
				errors.push("visible must be a boolean or function");
			}
		}

		if (
			currentItem.canAccess !== undefined &&
			typeof currentItem.canAccess !== "function"
		) {
			errors.push("canAccess must be a function");
		}

		if (currentItem.items !== undefined && !Array.isArray(currentItem.items)) {
			errors.push("items must be an array");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	});

	// Sanitized item with safe defaults
	const sanitizedItem = computed((): AppSidebarItem => {
		const currentItem = item.value;

		return {
			title:
				typeof currentItem.title === "string"
					? currentItem.title.trim()
					: "Navigation Item",
			url:
				typeof currentItem.url === "string"
					? currentItem.url.trim() || undefined
					: undefined,
			icon: currentItem.icon,
			isActive: Boolean(currentItem.isActive),
			tooltip:
				typeof currentItem.tooltip === "string" && currentItem.tooltip.trim()
					? currentItem.tooltip.trim()
					: typeof currentItem.title === "string"
						? currentItem.title.trim()
						: "Navigation Item",
			visible: currentItem.visible ?? true,
			canAccess: currentItem.canAccess,
			items: Array.isArray(currentItem.items) ? currentItem.items : undefined,
		};
	});

	// Safe title with fallback
	const safeTitle = computed(() => {
		const title = sanitizedItem.value.title;
		return title && title.length > 0 ? title : "Navigation Item";
	});

	// Safe tooltip with fallback
	const safeTooltip = computed(() => {
		const tooltip = sanitizedItem.value.tooltip;
		return tooltip && tooltip.length > 0 ? tooltip : safeTitle.value;
	});

	// Check if item has valid URL
	const hasValidUrl = computed(() => {
		const url = sanitizedItem.value.url;
		return url && url.length > 0;
	});

	// Check if item has children
	const hasChildren = computed(() => {
		const items = sanitizedItem.value.items;
		return Array.isArray(items) && items.length > 0;
	});

	return {
		validationResult,
		sanitizedItem,
		safeTitle,
		safeTooltip,
		hasValidUrl,
		hasChildren,
		isValid: computed(() => validationResult.value.isValid),
		errors: computed(() => validationResult.value.errors),
	};
}
