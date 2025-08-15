/**
 * Test assertion helpers for consistent test validation
 */

import type { VueWrapper } from "@vue/test-utils";
import { expect } from "vitest";
import type { ComponentPublicInstance } from "vue";
import type { Tag } from "../domain/models/Tag.ts";

type TestWrapper = VueWrapper<ComponentPublicInstance>;

export function expectLoadingState(wrapper: TestWrapper): void {
	const hasLoadingText = wrapper.text().includes("Loading");
	const hasLoadingElement = wrapper
		.find('[data-testid*="loading"], .skeleton, .loading')
		.exists();

	expect(hasLoadingText || hasLoadingElement).toBe(true);
}

export function expectErrorState(
	wrapper: TestWrapper,
	errorMessage?: string,
): void {
	const text = wrapper.text();
	const hasErrorText =
		(typeof errorMessage === "string" ? text.includes(errorMessage) : false) ||
		/error/i.test(text) ||
		/failed/i.test(text);
	const hasErrorElement = wrapper
		.find('[data-testid*="error"], .error, .alert, [role="alert"]')
		.exists();

	expect(hasErrorText || hasErrorElement).toBe(true);
}

export function expectEmptyState(wrapper: TestWrapper): void {
	const text = wrapper.text();
	const hasEmptyText = text.includes("No tags") || /empty/i.test(text);
	const hasEmptyElement = wrapper.find('[data-testid*="empty"]').exists();

	expect(hasEmptyText || hasEmptyElement).toBe(true);
}

export function expectTagDisplay(wrapper: TestWrapper, tag: Tag): void {
	expect(wrapper.text()).toContain(tag.name);
	expect(wrapper.text()).toContain(tag.subscriberCount.toString());
}

export function expectTagsDisplay(wrapper: TestWrapper, tags: Tag[]): void {
	tags.forEach((tag) => {
		expectTagDisplay(wrapper, tag);
	});
}

export function expectValidationErrors(wrapper: TestWrapper): void {
	const hasNameError = wrapper.find('[data-testid="name-error"]').exists();
	const text = wrapper.text();
	const hasValidationText = /required|empty|Tag name/i.test(text);

	expect(hasNameError || hasValidationText).toBe(true);
}

export function expectButtonDisabled(
	wrapper: TestWrapper,
	testId: string,
): void {
	const button = wrapper.find(`[data-testid="${testId}"]`);
	expect(button.exists()).toBe(true);
	expect(button.attributes("disabled")).toBeDefined();
}

export function expectEventEmitted(
	wrapper: TestWrapper,
	eventName: string,
	expectedData?: unknown,
): void {
	expect(wrapper.emitted(eventName)).toBeTruthy();
	if (expectedData !== undefined) {
		expect(wrapper.emitted(eventName)?.[0]).toEqual([expectedData]);
	}
}

export function expectPerformanceWithinThreshold(
	actualTime: number,
	thresholdMs: number,
): void {
	expect(actualTime).toBeLessThan(thresholdMs);
}

export function expectFormValidationHandled(wrapper: TestWrapper): void {
	const hasNameError = wrapper.find('[data-testid="name-error"]').exists();
	const text = wrapper.text();
	const hasValidationText = /required|empty|Tag name|validation/i.test(text);

	// If no explicit error is shown, the form should not have emitted submit event
	const noSubmitEmitted = !wrapper.emitted("submit");

	expect(hasNameError || hasValidationText || noSubmitEmitted).toBe(true);
}

// Backwards-compatible object keeping original class-like access
export const TestAssertions = {
	expectLoadingState,
	expectErrorState,
	expectEmptyState,
	expectTagDisplay,
	expectTagsDisplay,
	expectValidationErrors,
	expectButtonDisabled,
	expectEventEmitted,
	expectPerformanceWithinThreshold,
	expectFormValidationHandled,
};
