// Vitest setup file for logger package
// This file is intentionally minimal as the logger package doesn't need complex setup

import { afterEach, beforeEach } from "vitest";

// Clean up global state between tests to prevent test interference
beforeEach(() => {
	// Clear any global logger state that might affect tests
	if (typeof globalThis !== "undefined") {
		// biome-ignore lint/suspicious/noExplicitAny: GlobalThis is used for browser compatibility
		delete (globalThis as any).__LOGGER_MANAGER__;
	}
});

// Additional cleanup after each test
afterEach(() => {
	// Ensure no test state leaks to the next test
	if (typeof globalThis !== "undefined") {
		// biome-ignore lint/suspicious/noExplicitAny: GlobalThis is used for browser compatibility
		delete (globalThis as any).__LOGGER_MANAGER__;
	}
});
