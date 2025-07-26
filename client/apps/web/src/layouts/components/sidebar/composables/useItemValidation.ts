/**
 * Item validation composable
 * Provides validation and sanitization for sidebar items
 */
import { type ComputedRef, computed } from "vue";
import type { AppSidebarItem, ValidationResult } from "../types";

export function useItemValidation(item: ComputedRef<AppSidebarItem>) {
	const validationResult = computed((): ValidationResult => {
		const errors: string[] = [];
		const currentItem = item.value;

		if (!currentItem.title || currentItem.title.trim().length === 0) {
			errors.push("Title is required and must be a non-empty string");
		}

		if (currentItem.url !== undefined) {
			if (currentItem.url.trim().length === 0) {
				errors.push("URL cannot be empty");
			} else if (
				!currentItem.url.startsWith("/") &&
				!currentItem.url.startsWith("http")
			) {
				errors.push("URL should start with '/' or 'http'");
			}
		}

		if (currentItem.tooltip !== undefined) {
			if (typeof currentItem.tooltip !== "string") {
				errors.push("Tooltip must be a string");
			}
		}

		if (
			currentItem.isActive !== undefined &&
			typeof currentItem.isActive !== "boolean"
		) {
			errors.push("isActive must be a boolean");
		}

		if (
			currentItem.visible !== undefined &&
			typeof currentItem.visible !== "boolean" &&
			typeof currentItem.visible !== "function"
		) {
			errors.push("visible must be a boolean or function");
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

		return { isValid: errors.length === 0, errors };
	});

	const sanitizedItem = computed((): AppSidebarItem => {
		const currentItem = item.value;
		return {
			title: currentItem.title.trim(),
			url:
				typeof currentItem.url === "string"
					? currentItem.url.trim() || undefined
					: undefined,
			icon: currentItem.icon,
			isActive: Boolean(currentItem.isActive),
			tooltip:
				typeof currentItem.tooltip === "string" && currentItem.tooltip.trim()
					? currentItem.tooltip.trim()
					: currentItem.title.trim(),
			visible: currentItem.visible ?? true,
			canAccess: currentItem.canAccess,
			items: Array.isArray(currentItem.items) ? currentItem.items : undefined,
		};
	});

	const safeTitle = computed(
		() => sanitizedItem.value.title || "Navigation Item",
	);
	const safeTooltip = computed(
		() => sanitizedItem.value.tooltip || safeTitle.value,
	);
	const hasValidUrl = computed(
		() => !!sanitizedItem.value.url && sanitizedItem.value.url.length > 0,
	);
	const hasChildren = computed(
		() =>
			Array.isArray(sanitizedItem.value.items) &&
			sanitizedItem.value.items.length > 0,
	);

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
