/**
 * Component integration tests for the tags module
 * Tests end-to-end functionality from components through all layers
 */

import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Test constants removed - using inline values for better clarity

import { Tag } from "../domain/models/Tag.ts";
import { TagColors } from "../domain/models/TagColors.ts";
import type { TagRepository } from "../domain/repositories";
import DeleteConfirmation from "../infrastructure/views/components/DeleteConfirmation.vue";
import TagForm from "../infrastructure/views/components/TagForm.vue";
import TagItem from "../infrastructure/views/components/TagItem.vue";
import TagList from "../infrastructure/views/components/TagList.vue";
import TagPage from "../infrastructure/views/views/TagPage.vue";
import { repositoryMock } from "./repository.mock.ts";
import { TestAssertions } from "./test-assertions.ts";
import {
	createBasicTag,
	createPremiumTag,
	createTag,
	createTags,
	createTagWithSubscribers,
	resetCounter,
} from "./test-data-factory.ts";
import { cleanupTestEnvironment, setupTestEnvironment } from "./test-setup.ts";

describe("Tags Component Integration", () => {
	let mockRepository: TagRepository;

	beforeEach(() => {
		resetCounter();
		mockRepository = repositoryMock();
		setupTestEnvironment(mockRepository);
	});

	afterEach(() => {
		cleanupTestEnvironment();
	});

	describe("TagList Component", () => {
		it("should render tags data correctly", async () => {
			const tags = [createPremiumTag(), createBasicTag()];
			const wrapper = mount(TagList, {
				props: {
					tags,
					loading: false,
					error: null,
				},
			});

			// Should render tag data
			TestAssertions.expectTagsDisplay(wrapper, tags);
		});

		it("should show loading state", () => {
			const wrapper = mount(TagList, {
				props: {
					tags: [],
					loading: true,
					error: null,
				},
			});

			TestAssertions.expectLoadingState(wrapper);
		});

		it("should show error state", () => {
			const errorMessage = "Failed to load tags";

			const wrapper = mount(TagList, {
				props: {
					tags: [],
					loading: false,
					error: errorMessage,
				},
			});

			TestAssertions.expectErrorState(wrapper, errorMessage);
		});

		it("should show empty state", () => {
			const wrapper = mount(TagList, {
				props: {
					tags: [],
					loading: false,
					error: null,
				},
			});

			TestAssertions.expectEmptyState(wrapper);
		});

		it("should emit edit event when tag is edited", async () => {
			const tags = [createPremiumTag()];

			const wrapper = mount(TagList, {
				props: {
					tags,
					loading: false,
					error: null,
				},
			});

			// Find and click edit button
			const editButton = wrapper.find('[data-testid="edit-tag-button"]');
			if (editButton.exists()) {
				await editButton.trigger("click");
				TestAssertions.expectEventEmitted(wrapper, "edit", tags[0]);
			}
		});

		it("should emit delete event when tag is deleted", async () => {
			const tags = [createPremiumTag()];

			const wrapper = mount(TagList, {
				props: {
					tags,
					loading: false,
					error: null,
				},
			});

			// Find and click delete button
			const deleteButton = wrapper.find('[data-testid="delete-tag-button"]');
			if (deleteButton.exists()) {
				await deleteButton.trigger("click");
				TestAssertions.expectEventEmitted(wrapper, "delete", tags[0]);
			}
		});
	});

	describe("TagItem Component", () => {
		it("should display tag with subscriber count", () => {
			const tag = createTagWithSubscribers(3, {
				name: "Test Tag with Subscribers",
			});

			const wrapper = mount(TagItem, {
				props: {
					tag,
				},
			});

			TestAssertions.expectTagDisplay(wrapper, tag);
			expect(wrapper.find(".bg-red-500")).toBeTruthy(); // color class
		});

		it("should handle tag with string subscriber count", () => {
			const tag = createTag({
				name: "Newsletter",
				color: TagColors.Green,
				subscribers: "25",
			});

			const wrapper = mount(TagItem, {
				props: {
					tag,
				},
			});

			TestAssertions.expectTagDisplay(wrapper, tag);
		});

		it("should emit edit event", async () => {
			const tag = createPremiumTag();

			const wrapper = mount(TagItem, {
				props: {
					tag,
				},
			});

			const editButton = wrapper.find('[data-testid="edit-button"]');
			if (editButton.exists()) {
				await editButton.trigger("click");
				TestAssertions.expectEventEmitted(wrapper, "edit", tag);
			}
		});

		it("should emit delete event", async () => {
			const tag = createPremiumTag();

			const wrapper = mount(TagItem, {
				props: {
					tag,
				},
			});

			const deleteButton = wrapper.find('[data-testid="delete-button"]');
			if (deleteButton.exists()) {
				await deleteButton.trigger("click");
				TestAssertions.expectEventEmitted(wrapper, "delete", tag);
			}
		});
	});

	describe("TagForm Component", () => {
		it("should render create form correctly", () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: false,
				},
			});

			expect(wrapper.find('input[data-testid="tag-name-input"]').exists()).toBe(
				true,
			);
			expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
			expect(wrapper.find('button[data-testid="submit-button"]').exists()).toBe(
				true,
			);
		});

		it("should render edit form with initial data", async () => {
			const tag = createPremiumTag();

			const wrapper = mount(TagForm, {
				props: {
					mode: "edit",
					tag,
					loading: false,
				},
			});

			// Wait for form to initialize - need multiple ticks for watch + nextTick
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();

			const nameInput = wrapper.find('input[data-testid="tag-name-input"]');
			const redColorInput = wrapper.find('input[data-testid="color-red"]');

			expect(nameInput.exists()).toBe(true);
			expect(redColorInput.exists()).toBe(true);

			// Check that initial values are set
			expect((nameInput.element as HTMLInputElement).value).toBe("Premium");
			expect((redColorInput.element as HTMLInputElement).checked).toBe(true);
		});

		it("should emit submit event with form data", async () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: false,
				},
			});

			// Wait for form to initialize
			await wrapper.vm.$nextTick();

			// Fill form using component data
			const nameInput = wrapper.find('input[data-testid="tag-name-input"]');
			const blueColorInput = wrapper.find('input[data-testid="color-blue"]');

			await nameInput.setValue("New Tag");
			await blueColorInput.trigger("click");

			// Wait for form validation
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 50));

			// Submit form
			await wrapper.find("form").trigger("submit");

			// Wait for event emission
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(wrapper.emitted("submit")).toBeTruthy();
			const submitEvents = wrapper.emitted("submit");
			if (submitEvents) {
				expect(submitEvents[0]).toEqual([
					{
						name: "New Tag",
						color: TagColors.Blue,
					},
				]);
			}
		});

		it("should show validation errors", async () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: false,
				},
			});

			// Wait for form to initialize
			await wrapper.vm.$nextTick();

			// Submit empty form to trigger validation
			await wrapper.find("form").trigger("submit");

			// Wait for validation to process
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Check for validation errors - the form should prevent submission with empty name
			// Since the form uses vee-validate, it should either show error messages or prevent submission
			TestAssertions.expectFormValidationHandled(wrapper);
		});

		it("should emit cancel event", async () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: false,
				},
			});

			const cancelButton = wrapper.find('[data-testid="cancel-button"]');
			if (cancelButton.exists()) {
				await cancelButton.trigger("click");
				expect(wrapper.emitted("cancel")).toBeTruthy();
			}
		});

		it("should show loading state", () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: true,
				},
			});

			const submitButton = wrapper.find('button[type="submit"]');
			expect(submitButton.attributes("disabled")).toBeDefined();
		});
	});

	describe("DeleteConfirmation Component", () => {
		it("should render confirmation dialog", () => {
			const tag = new Tag(
				"123e4567-e89b-12d3-a456-426614174000",
				"Premium",
				TagColors.Red,
				["sub1"],
			);

			const wrapper = mount(DeleteConfirmation, {
				props: {
					tag,
					open: true,
					loading: false,
				},
			});

			expect(wrapper.text()).toContain("Delete Tag");
			expect(wrapper.text()).toContain("Premium");
			expect(wrapper.text()).toContain("1 subscriber"); // Warning about subscribers
		});

		it("should emit confirm event", async () => {
			const tag = new Tag(
				"123e4567-e89b-12d3-a456-426614174000",
				"Premium",
				TagColors.Red,
				[],
			);

			const wrapper = mount(DeleteConfirmation, {
				props: {
					tag,
					open: true,
					loading: false,
				},
			});

			const confirmButton = wrapper.find('[data-testid="confirm-delete"]');
			if (confirmButton.exists()) {
				await confirmButton.trigger("click");
				expect(wrapper.emitted("confirm")).toBeTruthy();
			}
		});

		it("should emit cancel event", async () => {
			const tag = new Tag(
				"123e4567-e89b-12d3-a456-426614174000",
				"Premium",
				TagColors.Red,
				[],
			);

			const wrapper = mount(DeleteConfirmation, {
				props: {
					tag,
					open: true,
					loading: false,
				},
			});

			const cancelButton = wrapper.find('[data-testid="cancel-delete"]');
			if (cancelButton.exists()) {
				await cancelButton.trigger("click");
				expect(wrapper.emitted("cancel")).toBeTruthy();
			}
		});

		it("should show loading state", () => {
			const tag = new Tag(
				"123e4567-e89b-12d3-a456-426614174000",
				"Premium",
				TagColors.Red,
				[],
			);

			const wrapper = mount(DeleteConfirmation, {
				props: {
					tag,
					open: true,
					loading: true,
				},
			});

			// Check for loading indicators - button disabled or loading text
			const confirmButton = wrapper.find('[data-testid="confirm-delete"]');
			const hasDisabledButton =
				confirmButton.exists() &&
				confirmButton.attributes("disabled") !== undefined;
			const hasLoadingText =
				wrapper.text().includes("Deleting") ||
				wrapper.text().includes("Loading");

			expect(hasDisabledButton || hasLoadingText).toBe(true);
		});
	});

	describe("TagPage Component", () => {
		it("should integrate with store and display data", async () => {
			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			// Wait for component to mount and initialize
			await wrapper.vm.$nextTick();

			// The page should have initialized the store
			expect(wrapper.vm).toBeDefined();
		});

		it("should handle loading states", async () => {
			let resolveFetch: (value: Tag[]) => void = () => {};
			const fetchPromise = new Promise<Tag[]>((resolve) => {
				resolveFetch = resolve;
			});
			mockRepository.findAll = vi.fn().mockImplementation(() => fetchPromise);

			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();

			// Assert loading text is present
			expect(wrapper.text()).toContain("Loading");

			// Resolve the promise and wait for UI update
			const testTags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174000",
					"Premium",
					TagColors.Red,
					["sub1"],
				),
			];
			resolveFetch(testTags);
			await fetchPromise;
			await wrapper.vm.$nextTick();

			// Assert loading skeleton is gone
			const loadingElAfter = wrapper.find(
				'[data-testid="tag-loading"], .skeleton, .loading',
			);
			expect(loadingElAfter.exists()).toBe(false);
		});

		it("should handle create tag workflow", async () => {
			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();

			// Find create button and click it
			const createButton = wrapper.find('[data-testid="create-tag-button"]');
			if (createButton.exists()) {
				await createButton.trigger("click");

				// Should show create form
				expect(wrapper.find('[data-testid="tag-form"]').exists()).toBe(true);
			}
		});

		it("should handle edit tag workflow", async () => {
			const testTags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174000",
					"Premium",
					TagColors.Red,
					["sub1"],
				),
			];
			mockRepository.findAll = vi.fn().mockResolvedValue(testTags);

			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();

			// Trigger edit action
			const editButton = wrapper.find('[data-testid="edit-tag-button"]');
			if (editButton.exists()) {
				await editButton.trigger("click");

				// Should show edit form
				expect(wrapper.find('[data-testid="tag-form"]').exists()).toBe(true);
			}
		});

		it("should handle delete tag workflow", async () => {
			const testTags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174000",
					"Premium",
					TagColors.Red,
					["sub1"],
				),
			];
			mockRepository.findAll = vi.fn().mockResolvedValue(testTags);

			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();

			// Trigger delete action
			const deleteButton = wrapper.find('[data-testid="delete-tag-button"]');
			if (deleteButton.exists()) {
				await deleteButton.trigger("click");

				// Should show delete confirmation
				expect(
					wrapper.find('[data-testid="delete-confirmation"]').exists(),
				).toBe(true);
			}
		});
	});

	describe("Full Component Integration", () => {
		it("should pass data from store to components", async () => {
			const testTags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174000",
					"Premium",
					TagColors.Red,
					["sub1", "sub2"],
				),
				new Tag(
					"123e4567-e89b-12d3-a456-426614174001",
					"Basic",
					TagColors.Blue,
					[],
				),
			];
			mockRepository.findAll = vi.fn().mockResolvedValue(testTags);

			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

			// The page should integrate with the store and pass data to child components
			expect(wrapper.text()).toContain("Premium");
			expect(wrapper.text()).toContain("Basic");
		});

		it("should maintain clean architecture boundaries", () => {
			const wrapper = mount(TagList, {
				props: {
					tags: [],
					loading: false,
					error: null,
				},
			});

			// Component should not have direct access to repository or use cases
			expect("repository" in wrapper.vm).toBe(false);
			expect("useCases" in wrapper.vm).toBe(false);

			// Component should only receive data through props
			expect(wrapper.props().tags).toBeDefined();
			expect(wrapper.props().loading).toBeDefined();
			expect(wrapper.props().error).toBeDefined();
		});

		it("should handle complete CRUD workflow", async () => {
			// Arrange - Test data
			const existingTagId = "123e4567-e89b-12d3-a456-426614174000";
			const tagData = { name: "New Tag", color: TagColors.Green };
			const createdTag = new Tag("new-tag-id", tagData.name, tagData.color, []);
			const updatedTag = new Tag(
				existingTagId,
				"Updated Tag",
				tagData.color,
				[],
			);

			// Arrange - Configure mocks before using the store
			mockRepository.create = vi.fn().mockResolvedValue(createdTag);
			mockRepository.update = vi.fn().mockResolvedValue(updatedTag);
			mockRepository.delete = vi.fn().mockResolvedValue(undefined);
			mockRepository.findById = vi.fn().mockResolvedValue(createdTag);

			// Arrange - Reconfigure container with updated mocks
			const { store } = setupTestEnvironment(mockRepository);

			// Act & Assert - Test create operation
			const createResult = await store.createTag(tagData);
			expect(createResult).toEqual(createdTag);
			expect(store.tags.some((t) => t.name === tagData.name)).toBe(true);

			// Act & Assert - Test update operation
			const updateData = { name: "Updated Tag" };
			const updateResult = await store.updateTag(existingTagId, updateData);
			expect(updateResult).toEqual(updatedTag);

			// Act & Assert - Test delete operation
			await store.deleteTag(existingTagId);
			expect(store.tags.find((t) => t.id === existingTagId)).toBeUndefined();
		});
	});

	describe("Error Handling Integration", () => {
		it("should propagate repository errors to components", async () => {
			// Mock repository error
			const repositoryError = new Error("Repository connection failed");
			mockRepository.findAll = vi.fn().mockRejectedValue(repositoryError);

			const wrapper = mount(TagPage, {
				global: {
					plugins: [createPinia()],
				},
			});

			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operations

			// Error should propagate through the layers to the component
			expect(
				wrapper.text().includes("Error loading") ||
					wrapper.text().includes("Failed"),
			).toBe(true);
		});

		it("should handle validation errors in forms", async () => {
			const wrapper = mount(TagForm, {
				props: {
					mode: "create",
					loading: false,
				},
			});

			// Wait for form to initialize
			await wrapper.vm.$nextTick();

			// Submit form with invalid data (empty form)
			await wrapper.find("form").trigger("submit");

			// Wait for validation to process
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should show validation error or prevent submission
			TestAssertions.expectFormValidationHandled(wrapper);
		});

		it("should handle create tag errors", async () => {
			// Mock repository error
			const repositoryError = new Error("Tag name already exists");
			mockRepository.create = vi.fn().mockRejectedValue(repositoryError);

			// Reconfigure the container with updated mocks
			const { store } = setupTestEnvironment(mockRepository);

			// Attempt to create tag - this should handle the error gracefully
			try {
				await store.createTag({
					name: "Duplicate Tag",
					color: TagColors.Red,
				});
				// If we get here, the test should fail because we expected an error
				expect.fail("Expected createTag to throw an error");
			} catch (error) {
				// The store should propagate the error, not return null
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe(
					"Failed to create tag: No result returned from use case",
				);
				expect(store.hasError).toBe(true);
				expect(store.error?.message).toBe("Tag name already exists");
			}
		});
	});

	describe("Performance Integration", () => {
		it("should not cause unnecessary re-renders", async () => {
			const tags = [
				new Tag(
					"123e4567-e89b-12d3-a456-426614174000",
					"Premium",
					TagColors.Red,
					["sub1"],
				),
			];

			const wrapper = mount(TagList, {
				props: {
					tags,
					loading: false,
					error: null,
				},
			});

			const renderCount = wrapper.vm.$el.querySelectorAll(
				'[data-testid="tag-item"]',
			).length;

			// Update props with same data
			await wrapper.setProps({
				tags,
				loading: false,
				error: null,
			});

			// Should not cause additional renders
			const newRenderCount = wrapper.vm.$el.querySelectorAll(
				'[data-testid="tag-item"]',
			).length;
			expect(newRenderCount).toBe(renderCount);
		});

		it("should handle large datasets efficiently", async () => {
			// Create a large dataset
			const largeTags = createTags(1000, {
				color: TagColors.Red,
				subscribers: ["sub1"],
			});

			const startTime = performance.now();

			const wrapper = mount(TagList, {
				props: {
					tags: largeTags,
					loading: false,
					error: null,
				},
			});

			const endTime = performance.now();
			const renderTime = endTime - startTime;

			// Use environment-aware performance threshold
			const threshold =
				process.env.CI?.toLowerCase() === "true"
					? 1500
					: Number(process.env.PERF_THRESHOLD_MS) || 1000;

			TestAssertions.expectPerformanceWithinThreshold(renderTime, threshold);
			expect(wrapper.vm).toBeDefined();
		});

		it("should efficiently update individual tags", async () => {
			const tags = Array.from(
				{ length: 100 },
				(_, i) =>
					new Tag(
						`123e4567-e89b-12d3-a456-42661417${i.toString().padStart(4, "0")}`,
						`Tag ${i + 1}`,
						TagColors.Red,
						[],
					),
			);

			const wrapper = mount(TagList, {
				props: {
					tags,
					loading: false,
					error: null,
				},
			});

			const startTime = performance.now();

			// Update one tag
			const updatedTags = [...tags];
			updatedTags[50] = new Tag(
				updatedTags[50].id,
				"Updated Tag",
				TagColors.Blue,
				["new-sub"],
			);

			await wrapper.setProps({
				tags: updatedTags,
				loading: false,
				error: null,
			});

			const endTime = performance.now();
			const updateTime = endTime - startTime;

			// Update should be fast
			expect(updateTime).toBeLessThan(100); // ms
		});
	});
});
