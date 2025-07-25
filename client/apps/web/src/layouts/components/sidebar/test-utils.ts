/**
 * Test utilities for sidebar components
 * Provides reusable test helpers and mocks
 */

import type { VueWrapper } from "@vue/test-utils";
import { expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";
import type { MockComponentDefinition, TestRouterConfig } from "./test-types";
import type { AppSidebarItem } from "./types";

/**
 * Creates a test router with predefined routes
 */
export function createTestRouter(
	additionalRoutes: TestRouterConfig[] = [],
): Router {
	const defaultRoutes: TestRouterConfig[] = [
		{ path: "/", component: { template: "<div>Home</div>" } },
		{ path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
		{ path: "/settings", component: { template: "<div>Settings</div>" } },
		{ path: "/admin/users", component: { template: "<div>Users</div>" } },
		{
			path: "/admin/settings",
			component: { template: "<div>Admin Settings</div>" },
		},
		{ path: "/profile", component: { template: "<div>Profile</div>" } },
	];

	return createRouter({
		history: createWebHistory(),
		routes: [...defaultRoutes, ...additionalRoutes],
	});
}

/**
 * Creates mock UI components for testing
 */
export function createMockUIComponents(): Record<
	string,
	MockComponentDefinition
> {
	return {
		Sidebar: {
			name: "Sidebar",
			props: ["collapsible", "variant", "side"],
			template: `
        <div
          class="sidebar"
          :data-collapsible="collapsible"
          :data-variant="variant"
          :data-side="side"
        >
          <slot />
        </div>
      `,
		},
		SidebarContent: {
			name: "SidebarContent",
			template: "<div class='sidebar-content'><slot /></div>",
		},
		SidebarHeader: {
			name: "SidebarHeader",
			template: "<div class='sidebar-header'><slot /></div>",
		},
		SidebarFooter: {
			name: "SidebarFooter",
			template: "<div class='sidebar-footer'><slot /></div>",
		},
		SidebarGroup: {
			name: "SidebarGroup",
			template: "<div class='sidebar-group'><slot /></div>",
		},
		SidebarMenu: {
			name: "SidebarMenu",
			template: "<ul class='sidebar-menu'><slot /></ul>",
		},
		SidebarMenuSkeleton: {
			name: "SidebarMenuSkeleton",
			template: "<li class='skeleton-item'></li>",
		},
	};
}

/**
 * Creates a mock navigation filtering composable
 */
export function createMockNavigationFiltering(
	initialItems: AppSidebarItem[] = [],
	initialLoading = false,
	initialError = false,
) {
	const filteredItems = ref(initialItems);
	const isLoading = ref(false);
	const shouldShowLoading = ref(initialLoading);
	const shouldShowError = ref(initialError);
	const errorState = ref({ hasError: initialError, recoverable: true });

	return {
		filteredItems,
		isLoading,
		shouldShowLoading,
		shouldShowError,
		errorState,
		filterItems: vi.fn(),
		clearError: vi.fn(),
		// Helper methods for tests
		setFilteredItems: (items: AppSidebarItem[]) => {
			filteredItems.value = items;
		},
		setLoading: (loading: boolean) => {
			shouldShowLoading.value = loading;
		},
		setError: (error: boolean) => {
			shouldShowError.value = error;
			errorState.value.hasError = error;
		},
	};
}

/**
 * Waits for async operations to complete in tests
 */
export async function waitForAsyncOperations(ticks = 3): Promise<void> {
	for (let i = 0; i < ticks; i++) {
		await nextTick();
	}
}

/**
 * Creates a performance test helper
 */
export function createPerformanceTest(
	operation: () => void,
	maxTime = 100,
): { duration: number; passed: boolean } {
	const startTime = performance.now();
	operation();
	const endTime = performance.now();
	const duration = endTime - startTime;

	return {
		duration,
		passed: duration <= maxTime,
	};
}

/**
 * Asserts that a component renders specific navigation items
 */
export function assertNavigationItems(
	wrapper: VueWrapper<AppSidebarItem>,
	expectedTitles: string[],
): void {
	const sidebarItems = wrapper.findAllComponents({ name: "AppSidebarItem" });
	expect(sidebarItems).toHaveLength(expectedTitles.length);

	expectedTitles.forEach((title, index) => {
		expect(sidebarItems[index].props("item").title).toBe(title);
	});
}

/**
 * Simulates async permission check with controllable timing
 */
export function createAsyncPermissionMock(
	result: boolean,
	delay = 10,
): () => Promise<boolean> {
	return vi.fn().mockImplementation(async () => {
		await new Promise((resolve) => setTimeout(resolve, delay));
		return result;
	});
}

/**
 * Creates a mock error that can be thrown in tests
 */
export function createMockError(message = "Test error"): Error {
	const error = new Error(message);
	error.stack = `Error: ${message}\n    at test (test.ts:1:1)`;
	return error;
}

/**
 * Helper to test error recovery scenarios
 */
export async function testErrorRecovery(
	wrapper: VueWrapper<AppSidebarItem>,
	triggerError: () => void,
	triggerRecovery: () => void,
	expectedErrorText: string,
	expectedRecoveryText: string,
): Promise<void> {
	// Trigger error
	triggerError();
	await waitForAsyncOperations();
	expect(wrapper.text()).toContain(expectedErrorText);

	// Trigger recovery
	triggerRecovery();
	await waitForAsyncOperations();
	expect(wrapper.text()).toContain(expectedRecoveryText);
}

/**
 * Validates that proper ARIA attributes are set
 */
export function assertAccessibilityAttributes(
	wrapper: VueWrapper<AppSidebarItem>,
	expectedAttributes: Record<string, string>,
): void {
	Object.entries(expectedAttributes).forEach(([attribute, expectedValue]) => {
		const element = wrapper.find(`[${attribute}]`);
		expect(element.exists()).toBe(true);
		expect(element.attributes(attribute)).toBe(expectedValue);
	});
}

/**
 * Creates a test scenario for large navigation structures
 */
export function createLargeNavigationTest(
	itemCount: number,
	maxRenderTime = 100,
) {
	return {
		items: Array.from({ length: itemCount }, (_, i) => ({
			title: `Item ${i + 1}`,
			url: `/item${i + 1}`,
		})),
		maxRenderTime,
		validate: (wrapper: VueWrapper<AppSidebarItem>) => {
			const sidebarItems = wrapper.findAllComponents({
				name: "AppSidebarItem",
			});
			expect(sidebarItems).toHaveLength(itemCount);
		},
	};
}
