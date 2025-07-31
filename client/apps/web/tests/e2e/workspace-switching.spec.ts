/**
 * E2E tests for workspace switching functionality
 * Tests the complete user flow from workspace selection to UI updates
 */

import { expect, type Page, test } from "@playwright/test";

// Types
interface MockWorkspace {
	id: string;
	name: string;
	description: string;
}

// Test data
const mockWorkspaces: MockWorkspace[] = [
	{
		id: "123e4567-e89b-12d3-a456-426614174000",
		name: "Development Workspace",
		description: "Main development environment",
	},
	{
		id: "123e4567-e89b-12d3-a456-426614174001",
		name: "Testing Workspace",
		description: "Testing and QA environment",
	},
];

// Helper functions for common test operations
const setupWorkspaceApiMocks = async (
	page: Page,
	workspaces: MockWorkspace[] = mockWorkspaces,
) => {
	await page.route("/api/workspace", async (route: any) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				data: workspaces,
			}),
		});
	});

	await page.route("/api/workspace/*", async (route: any) => {
		const url = route.request().url();
		const workspaceId = url.split("/").pop();
		const workspace = workspaces.find((w) => w.id === workspaceId);

		if (workspace) {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: workspace,
				}),
			});
		} else {
			await route.fulfill({
				status: 404,
				contentType: "application/json",
				body: JSON.stringify({
					message: "Workspace not found",
				}),
			});
		}
	});
};

const setupErrorApiMock = async (
	page: any,
	status = 500,
	message = "Internal server error",
) => {
	await page.route("/api/workspace", async (route: any) => {
		await route.fulfill({
			status,
			contentType: "application/json",
			body: JSON.stringify({ message }),
		});
	});
};

const setupDelayedApiMock = async (page: any, delay = 1000) => {
	await page.route("/api/workspace", async (route: any) => {
		await new Promise((resolve) => setTimeout(resolve, delay));
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				data: mockWorkspaces,
			}),
		});
	});
};

// Test selectors - centralized for maintainability
const SELECTORS = {
	workspaceSelector: '[data-testid="workspace-selector"]',
	workspaceDisplayText: '[data-testid="workspace-display-text"]',
	workspaceSelectorTrigger: '[data-testid="workspace-selector-trigger"]',
	workspaceDropdown: '[data-testid="workspace-dropdown"]',
	workspaceLoading: '[data-testid="workspace-loading"]',
	workspaceError: '[data-testid="workspace-error"]',
	workspaceRetryButton: '[data-testid="workspace-retry-button"]',
	workspaceEmptyState: '[data-testid="workspace-empty-state"]',
	workspaceItem: (id: string) => `[data-testid="workspace-item-${id}"]`,
} as const;

// Page object helpers
const WorkspacePage = {
	async waitForSelector(page: any) {
		await expect(page.locator(SELECTORS.workspaceSelector)).toBeVisible();
	},

	async selectWorkspace(page: any, workspaceId: string) {
		await page.locator(SELECTORS.workspaceSelectorTrigger).click();
		await expect(page.locator(SELECTORS.workspaceDropdown)).toBeVisible();
		await page.locator(SELECTORS.workspaceItem(workspaceId)).click();
	},

	async getDisplayedWorkspaceName(page: any) {
		return await page.locator(SELECTORS.workspaceDisplayText).textContent();
	},

	async waitForLoading(page: any) {
		await expect(page.locator(SELECTORS.workspaceLoading)).toBeVisible();
		await expect(page.locator(SELECTORS.workspaceLoading)).not.toBeVisible();
	},

	async expectError(page: any, message?: string) {
		await expect(page.locator(SELECTORS.workspaceError)).toBeVisible();
		if (message) {
			await expect(page.locator(SELECTORS.workspaceError)).toContainText(
				message,
			);
		}
	},

	async retryLoading(page: any) {
		await page.locator(SELECTORS.workspaceRetryButton).click();
	},
};

test.describe("Workspace Switching E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Setup default API mocks
		await setupWorkspaceApiMocks(page);
		// Navigate to the application
		await page.goto("/dashboard");
	});

	test("should load and display available workspaces", async ({ page }) => {
		// Wait for the workspace selector to be visible
		await WorkspacePage.waitForSelector(page);

		// Check that the first workspace is selected by default
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Development Workspace",
		);
	});

	test("should switch workspaces when user selects different workspace", async ({
		page,
	}) => {
		// Wait for workspace selector to load
		await WorkspacePage.waitForSelector(page);

		// Select the second workspace
		await WorkspacePage.selectWorkspace(page, mockWorkspaces[1].id);

		// Verify the workspace has changed
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Testing Workspace",
		);
	});

	test("should persist workspace selection after page refresh", async ({
		page,
	}) => {
		// Select a specific workspace
		await WorkspacePage.selectWorkspace(page, mockWorkspaces[1].id);

		// Wait for selection to be applied
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Testing Workspace",
		);

		// Refresh the page
		await page.reload();

		// Wait for the page to load again
		await WorkspacePage.waitForSelector(page);

		// Verify the same workspace is still selected
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Testing Workspace",
		);
	});

	test("should handle workspace loading states correctly", async ({ page }) => {
		// Mock a slow API response
		await setupDelayedApiMock(page, 1000);

		// Navigate to trigger loading
		await page.goto("/dashboard");

		// Wait for loading cycle to complete
		await WorkspacePage.waitForLoading(page);

		// Verify workspaces are loaded
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Development Workspace",
		);
	});

	test("should handle workspace API errors gracefully", async ({ page }) => {
		// Mock API error
		await setupErrorApiMock(page);

		await page.goto("/dashboard");

		// Check that error state is shown
		await WorkspacePage.expectError(page, "Error loading workspaces");

		// Check that retry button is available
		await expect(page.locator(SELECTORS.workspaceRetryButton)).toBeVisible();
	});

	test("should retry workspace loading when retry button is clicked", async ({
		page,
	}) => {
		let requestCount = 0;

		// Mock API to fail first time, succeed second time
		await page.route("/api/workspace", async (route) => {
			requestCount++;
			if (requestCount === 1) {
				await route.fulfill({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify({
						message: "Internal server error",
					}),
				});
			} else {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						data: mockWorkspaces,
					}),
				});
			}
		});

		await page.goto("/dashboard");

		// Wait for error state
		await WorkspacePage.expectError(page);

		// Click retry button
		await WorkspacePage.retryLoading(page);

		// Wait for successful load
		await expect(page.locator(SELECTORS.workspaceError)).not.toBeVisible();
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Development Workspace",
		);
	});

	test("should update localStorage when workspace is selected", async ({
		page,
	}) => {
		const targetWorkspaceId = mockWorkspaces[1].id;

		// Select a workspace
		await WorkspacePage.selectWorkspace(page, targetWorkspaceId);

		// Check localStorage was updated
		const storedWorkspaceId = await page.evaluate(() => {
			return localStorage.getItem("selectedWorkspaceId");
		});

		expect(storedWorkspaceId).toBe(targetWorkspaceId);
	});

	test("should handle empty workspace list", async ({ page }) => {
		// Mock empty workspace list
		await setupWorkspaceApiMocks(page, []);

		await page.goto("/dashboard");

		// Check empty state is shown
		await expect(page.locator(SELECTORS.workspaceEmptyState)).toBeVisible();
		await expect(page.locator(SELECTORS.workspaceEmptyState)).toContainText(
			"No workspaces available",
		);
	});

	test("should validate workspace switching with keyboard navigation", async ({
		page,
	}) => {
		// Open workspace selector with keyboard
		await page.locator(SELECTORS.workspaceSelectorTrigger).focus();
		await page.keyboard.press("Enter");

		// Navigate with arrow keys
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");

		// Verify workspace changed
		await expect(page.locator(SELECTORS.workspaceDisplayText)).toContainText(
			"Testing Workspace",
		);
	});
});
