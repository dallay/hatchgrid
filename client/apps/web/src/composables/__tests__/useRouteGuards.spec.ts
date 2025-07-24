import { createPinia, setActivePinia } from "pinia";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockedFunction,
	vi,
} from "vitest";
import type {
	NavigationGuardNext,
	RouteLocationNormalized,
	Router,
} from "vue-router";

// Mock the dependencies at the module level
vi.mock("@/stores/auth");
vi.mock("@/services/account.service");

// Import after mocking
import { useRouteGuards } from "@/composables/useRouteGuards";
import AccountService from "@/services/account.service";
import { useAuthStore } from "@/stores/auth";

// Type the mocked modules
const mockUseAuthStore = vi.mocked(useAuthStore);
const MockAccountService = vi.mocked(AccountService);

// Helper function to create mock route objects
const createMockRoute = (
	path: string,
	meta: Record<string, unknown> = {},
): RouteLocationNormalized => ({
	path,
	fullPath: path,
	name: undefined,
	params: {},
	query: {},
	hash: "",
	matched: [],
	redirectedFrom: undefined,
	meta,
});

describe("useRouteGuards", () => {
	let router: Router;
	let mockAuthStore: ReturnType<typeof useAuthStore>;
	let mockAccountService: InstanceType<typeof AccountService>;
	let guardCallback: (
		to: RouteLocationNormalized,
		from: RouteLocationNormalized,
		next: NavigationGuardNext,
	) => Promise<void>;

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();

		// Create mock auth store
		mockAuthStore = {
			authenticated: false,
		} as ReturnType<typeof useAuthStore>;

		// Create mock account service
		mockAccountService = {
			update: vi.fn(),
			hasAnyAuthorityAndCheckAuth: vi.fn(),
		} as unknown as InstanceType<typeof AccountService>;

		// Setup mocks
		mockUseAuthStore.mockReturnValue(mockAuthStore);
		MockAccountService.mockImplementation(() => mockAccountService);

		// Create router mock that captures the guard callback
		router = {
			beforeResolve: vi.fn((callback) => {
				guardCallback = callback;
			}),
		} as unknown as Router;
	});

	it("should register beforeResolve guard", () => {
		useRouteGuards(router);
		expect(router.beforeResolve).toHaveBeenCalledWith(expect.any(Function));
	});

	it("should allow navigation to public pages without authentication", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = false;

		useRouteGuards(router);

		const to = createMockRoute("/login");
		const from = createMockRoute("/");

		await guardCallback(to, from, next);

		expect(next).toHaveBeenCalledWith();
		expect(mockAccountService.update).not.toHaveBeenCalled();
	});

	it("should redirect to /login if not authenticated and not on a public page", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = false;
		(
			mockAccountService.update as MockedFunction<() => Promise<void>>
		).mockRejectedValue(new Error("not authenticated"));

		useRouteGuards(router);

		const to = createMockRoute("/dashboard");
		const from = createMockRoute("/");

		await guardCallback(to, from, next);

		expect(mockAccountService.update).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith({
			path: "/login",
			query: { redirect: "/dashboard" },
		});
	});

	it("should redirect to /forbidden if authenticated but lacks required authorities", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = true;
		(
			mockAccountService.update as MockedFunction<() => Promise<void>>
		).mockResolvedValue(undefined);
		(
			mockAccountService.hasAnyAuthorityAndCheckAuth as MockedFunction<
				(authorities: string[]) => Promise<boolean>
			>
		).mockResolvedValue(false);

		useRouteGuards(router);

		const to = createMockRoute("/admin", { authorities: ["ROLE_ADMIN"] });
		const from = createMockRoute("/");

		await guardCallback(to, from, next);

		expect(mockAccountService.hasAnyAuthorityAndCheckAuth).toHaveBeenCalledWith(
			["ROLE_ADMIN"],
		);
		expect(next).toHaveBeenCalledWith({ path: "/forbidden" });
	});

	it("should allow navigation if authenticated and has required authorities", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = true;
		(
			mockAccountService.update as MockedFunction<() => Promise<void>>
		).mockResolvedValue(undefined);
		(
			mockAccountService.hasAnyAuthorityAndCheckAuth as MockedFunction<
				(authorities: string[]) => Promise<boolean>
			>
		).mockResolvedValue(true);

		useRouteGuards(router);

		const to = createMockRoute("/admin", { authorities: ["ROLE_ADMIN"] });
		const from = createMockRoute("/");

		await guardCallback(to, from, next);

		expect(mockAccountService.hasAnyAuthorityAndCheckAuth).toHaveBeenCalledWith(
			["ROLE_ADMIN"],
		);
		expect(next).toHaveBeenCalledWith();
	});

	it("should redirect to /login if not authenticated and route requires authorities", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = false;
		(
			mockAccountService.update as MockedFunction<() => Promise<void>>
		).mockResolvedValue(undefined);
		(
			mockAccountService.hasAnyAuthorityAndCheckAuth as MockedFunction<
				(authorities: string[]) => Promise<boolean>
			>
		).mockResolvedValue(false);

		useRouteGuards(router);

		const to = createMockRoute("/admin", { authorities: ["ROLE_ADMIN"] });
		const from = createMockRoute("/");

		await guardCallback(to, from, next);

		expect(mockAccountService.hasAnyAuthorityAndCheckAuth).toHaveBeenCalledWith(
			["ROLE_ADMIN"],
		);
		expect(next).toHaveBeenCalledWith({
			path: "/login",
			query: { redirect: "/admin" },
		});
	});

	it("should allow navigation if authenticated and no authorities required", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = true;

		useRouteGuards(router);

		const to = {
			path: "/dashboard",
			fullPath: "/dashboard",
			meta: {},
		} as RouteLocationNormalized;
		const from = {} as RouteLocationNormalized;

		await guardCallback(to, from, next);

		expect(next).toHaveBeenCalledWith();
	});

	it("should handle register as public page", async () => {
		const next = vi.fn();
		mockAuthStore.authenticated = false;

		useRouteGuards(router);

		const to = {
			path: "/register",
			fullPath: "/register",
			meta: {},
		} as RouteLocationNormalized;
		const from = {} as RouteLocationNormalized;

		await guardCallback(to, from, next);

		expect(next).toHaveBeenCalledWith();
		expect(mockAccountService.update).not.toHaveBeenCalled();
	});
});
