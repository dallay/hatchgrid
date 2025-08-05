import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { vi } from "vitest";
import type { Subscriber } from "../../../../domain/models";
import { SubscriberStatus } from "../../../../domain/models";
import type { SubscriberRepository } from "../../../../domain/repositories/SubscriberRepository";
import { configureContainer, resetContainer } from "../../../di/container";
import {
	configureStoreFactory,
	resetInitialization,
} from "../../../di/initialization";
import { useSubscriberStore } from "../../../store/subscriber.store";
import SubscriberPage from "../SubscriberPage.vue";

// Mock data
export const mockSubscribers: Subscriber[] = [
	{
		id: "1",
		email: "john@example.com",
		name: "John Doe",
		status: SubscriberStatus.ENABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		email: "jane@example.com",
		status: SubscriberStatus.DISABLED,
		workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
		createdAt: "2024-01-02T00:00:00Z",
	},
];

export const mockStatusCounts = [
	{ count: 1, status: SubscriberStatus.ENABLED },
	{ count: 1, status: SubscriberStatus.DISABLED },
	{ count: 0, status: SubscriberStatus.BLOCKLISTED },
];

// Mock repository factory
export const createMockRepository = (): SubscriberRepository => ({
	fetchAll: vi.fn().mockResolvedValue(mockSubscribers),
	countByStatus: vi.fn().mockResolvedValue(mockStatusCounts),
	countByTags: vi.fn().mockResolvedValue([]),
});

// Test setup utilities
export interface TestSetup {
	wrapper: ReturnType<typeof mount>;
	store: ReturnType<typeof useSubscriberStore>;
	mockRepository: SubscriberRepository;
	consoleSpy: ReturnType<typeof vi.spyOn>;
}

export const setupTest = async (
	customRepository?: SubscriberRepository,
): Promise<TestSetup> => {
	// Mock console methods to prevent debug output
	const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});

	// Reset DI container
	resetContainer();
	resetInitialization();

	// Create mock repository
	const mockRepository = customRepository || createMockRepository();

	// Configure store factory to return the real store
	configureStoreFactory(() => useSubscriberStore());

	// Configure container with mock repository
	configureContainer({ customRepository: mockRepository });

	const wrapper = mount(SubscriberPage, {
		global: {
			plugins: [
				createTestingPinia({
					stubActions: false,
					createSpy: vi.fn,
				}),
			],
		},
	});

	// Get the real store instance
	const store = useSubscriberStore();

	// Wait for the component to mount and initialize
	await wrapper.vm.$nextTick();

	vi.clearAllMocks();

	return {
		wrapper,
		store,
		mockRepository,
		consoleSpy,
	};
};

// Mock UI components
export const mockUIComponents = () => {
	vi.mock("@/components/ui/button", () => ({
		Button: {
			template:
				'<button data-testid="button" @click="$emit(\'click\')"><slot /></button>',
		},
	}));

	vi.mock("@/components/ui/card", () => ({
		Card: { template: '<div data-testid="card"><slot /></div>' },
		CardContent: { template: '<div data-testid="card-content"><slot /></div>' },
		CardDescription: {
			template: '<div data-testid="card-description"><slot /></div>',
		},
		CardHeader: { template: '<div data-testid="card-header"><slot /></div>' },
		CardTitle: { template: '<div data-testid="card-title"><slot /></div>' },
	}));

	vi.mock("@/components/ui/badge", () => ({
		Badge: { template: '<span data-testid="badge"><slot /></span>' },
	}));

	vi.mock("@/components/ui/skeleton", () => ({
		Skeleton: { template: '<div data-testid="skeleton"></div>' },
	}));

	vi.mock("@/components/ui/alert", () => ({
		Alert: { template: '<div data-testid="alert"><slot /></div>' },
		AlertDescription: {
			template: '<div data-testid="alert-description"><slot /></div>',
		},
	}));
};

// Mock icons
export const mockIcons = () => {
	vi.mock("lucide-vue-next", () => ({
		RefreshCw: { template: '<div data-testid="refresh-icon"></div>' },
		Plus: { template: '<div data-testid="plus-icon"></div>' },
		Users: { template: '<div data-testid="users-icon"></div>' },
		UserCheck: { template: '<div data-testid="user-check-icon"></div>' },
		UserX: { template: '<div data-testid="user-x-icon"></div>' },
		UserMinus: { template: '<div data-testid="user-minus-icon"></div>' },
	}));
};

// Mock SubscriberList component
export const mockSubscriberList = () => {
	vi.mock("../components", () => ({
		SubscriberList: {
			template:
				'<div data-testid="subscriber-list" @edit-subscriber="$emit(\'edit-subscriber\', $event)" @delete-subscriber="$emit(\'delete-subscriber\', $event)" @toggle-status="$emit(\'toggle-status\', $event)"></div>',
			props: ["subscribers", "loading", "error"],
			emits: ["edit-subscriber", "delete-subscriber", "toggle-status"],
		},
	}));
};

// Promise utilities for async testing
export const createControllablePromise = <T>() => {
	let resolvePromise: (value: T) => void;
	let rejectPromise: (error: Error) => void;

	const promise = new Promise<T>((resolve, reject) => {
		resolvePromise = resolve;
		rejectPromise = reject;
	});

	return {
		promise,
		resolve: (value: T) => resolvePromise?.(value),
		reject: (error: Error) => rejectPromise?.(error),
	};
};
