/**
 * Type definitions for sidebar component testing
 * Eliminates the need for 'any' types in tests
 */
import type { AppSidebarItem } from "./types";

export interface MockSidebarItem extends Partial<AppSidebarItem> {
	title: string;
}

export interface InvalidSidebarItem {
	title?: unknown;
	url?: unknown;
	visible?: unknown;
	canAccess?: unknown;
	isActive?: unknown;
	tooltip?: unknown;
	icon?: unknown;
	items?: unknown;
}

export interface TestNavigationScenario {
	name: string;
	items: AppSidebarItem[];
	expectedVisible: number;
	expectedFiltered: number;
}

export type MockAccessFunction = () => boolean | Promise<boolean>;

export type MockVisibilityFunction = () => boolean;

export interface TestRouterConfig {
	path: string;
	component: { template: string };
}

export interface PerformanceTestConfig {
	itemCount: number;
	maxRenderTime: number;
	description: string;
}

export interface ErrorTestScenario {
	name: string;
	error: Error | string;
	expectedBehavior: "hide" | "show-error" | "fallback";
}

// Type-safe mock creators
export type MockComponentDefinition = {
	name: string;
	props?: string[];
	template: string;
};

export type MockComposableReturn<T> = {
	[K in keyof T]: T[K];
};

// Helper types for test assertions
export type ExpectedSidebarState = {
	itemCount: number;
	showsLoading: boolean;
	showsError: boolean;
	errorMessage?: string;
};

export type NavigationTestCase = {
	description: string;
	input: AppSidebarItem[];
	route: string;
	expected: ExpectedSidebarState;
};
