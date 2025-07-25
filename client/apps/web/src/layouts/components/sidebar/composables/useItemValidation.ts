/**
 * Composable for runtime validation of sidebar items
 * Provides type guards and validation utilities
 */
import { type ComputedRef, computed } from "vue";
import type { AppSidebarItem } from "../types";

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Type guard to check if an object is a valid AppSidebarItem
 */
export function isValidSidebarItem(item: unknown): item is AppSidebarItem {
	if (!item || typeof item !== "object") return false;

	const obj = item as Record<string, unknown>;

	// Required: title must be a non-empty string
	if (!obj.title || typeof obj.title !== "string" || !obj.title.trim()) {
		return false;
	}

	// Optional validations
	const validations = [
		obj.url === undefined ||
			(typeof obj.url === "string" && obj.url.length > 0),
		obj.visible === undefined ||
			typeof obj.visible === "boolean" ||
			typeof obj.visible === "function",
		obj.canAccess === undefined || typeof obj.canAccess === "function",
		obj.isActive === undefined || typeof obj.isActive === "boolean",
		obj.tooltip === undefined ||
			(typeof obj.tooltip === "string" && obj.tooltip.length > 0),
		obj.icon === undefined || typeof obj.icon === "object",
		obj.items === undefined ||
			(Array.isArray(obj.items) && obj.items.every(isValidSidebarItem)),
	];

	return validations.every(Boolean);
}

/**
 * Validates a sidebar item and returns detailed results
 */
export function validateSidebarItem(item: AppSidebarItem): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Title validation
	if (!item.title?.trim()) {
		errors.push("Item title is required and cannot be empty");
	}

	// URL validation
	if (item.url && !item.url.startsWith("/") && !item.url.startsWith("http")) {
		errors.push(
			`Invalid URL format: "${item.url}". URLs should start with "/" or "http"`,
		);
	}

	// Icon validation
	if (item.icon && typeof item.icon !== "object") {
		warnings.push("Icon should be a Lucide icon component");
	}

	// Recursive validation for children
	if (item.items) {
		item.items.forEach((child, index) => {
			const childResult = validateSidebarItem(child);
			errors.push(
				...childResult.errors.map((error) => `Child ${index}: ${error}`),
			);
			warnings.push(
				...childResult.warnings.map((warning) => `Child ${index}: ${warning}`),
			);
		});
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Composable for validating sidebar items with reactive results
 */
export function useItemValidation(item: ComputedRef<AppSidebarItem>) {
	const validationResult = computed(() => validateSidebarItem(item.value));

	const isValid = computed(() => validationResult.value.isValid);
	const errors = computed(() => validationResult.value.errors);
	const warnings = computed(() => validationResult.value.warnings);

	// Development-only logging
	if (import.meta.env.DEV) {
		const logValidationIssues = () => {
			if (errors.value.length > 0) {
				console.error(
					`Sidebar item validation errors for "${item.value.title}":`,
					errors.value,
				);
			}
			if (warnings.value.length > 0) {
				console.warn(
					`Sidebar item validation warnings for "${item.value.title}":`,
					warnings.value,
				);
			}
		};

		// Log issues when they occur
		if (!isValid.value) {
			logValidationIssues();
		}
	}

	return {
		isValid,
		errors,
		warnings,
		validationResult,
	};
}
