import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, it } from "vitest";
import { useRouteGuards } from "@/composables/useRouteGuards";

// Stub for router mock
const createRouterMock = () => ({
	beforeResolve: vi.fn(),
});

describe("useRouteGuards", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("should register beforeResolve guard", () => {
		const router = createRouterMock();
		useRouteGuards(router as any);
		expect(router.beforeResolve).toHaveBeenCalled();
	});
	// Add more tests for guard logic (auth, authorities, redirects)
});
