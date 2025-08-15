/**
 * Test setup utilities for tags module tests
 * Handles proper initialization of dependencies for testing
 */

import type { VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { vi } from "vitest";
import type { TagService } from "../application/services/TagService";
import {
	configureTagServiceProvider,
	resetTagServiceProvider,
} from "../application/services/TagService";
import type { Tag } from "../domain/models";
import type { TagRepository } from "../domain/repositories/TagRepository";
import type { CreateTagData, UpdateTagData } from "../domain/usecases";
import {
	configureContainer,
	resetContainer,
} from "../infrastructure/di/container";
import {
	configureStoreFactory,
	resetInitialization,
} from "../infrastructure/di/initialization";
import { useTagStore } from "../infrastructure/store/tag.store";

/**
 * Extended store interface for testing with internal properties
 */
interface TestableStore extends ReturnType<typeof useTagStore> {
	useCases: unknown;
}

/**
 * Mock service implementation for testing
 */
class MockTagService implements TagService {
	private store: ReturnType<typeof useTagStore>;

	constructor(store: ReturnType<typeof useTagStore>) {
		this.store = store;
	}

	getTags(): Tag[] {
		return [...this.store.tags]; // Convert readonly array to mutable
	}
	isLoading() {
		return this.store.isLoading;
	}
	hasError() {
		return this.store.hasError;
	}
	getError(): Error | null {
		const storeError = this.store.error;
		if (!storeError) return null;

		// Convert store error to standard Error
		const error = new Error(storeError.message);
		error.name = storeError.code || "TagError";
		return error;
	}
	getTagCount() {
		return this.store.tagCount;
	}
	isDataLoaded() {
		return this.store.isDataLoaded;
	}

	async fetchTags() {
		await this.store.fetchTags();
	}
	async createTag(tagData: CreateTagData): Promise<Tag> {
		return await this.store.createTag(tagData);
	}
	async updateTag(id: string, tagData: UpdateTagData): Promise<Tag> {
		return await this.store.updateTag(id, tagData);
	}
	async deleteTag(id: string): Promise<void> {
		await this.store.deleteTag(id);
	}
	async refreshTags() {
		await this.store.refreshTags();
	}
	clearError() {
		this.store.clearError();
	}
	resetState() {
		this.store.resetState();
	}

	findTagById(id: string) {
		return this.store.findTagById(id);
	}
	findTagsByColor(color: string) {
		return this.store.findTagsByColor(color);
	}
	getTagsBySubscriberCount(ascending = false) {
		return this.store.getTagsBySubscriberCount(ascending);
	}
}

/**
 * Setup Pinia for testing
 */
function setupPinia() {
	setActivePinia(createPinia());
}

/**
 * Reset all dependency injection containers and providers
 */
function resetDependencies() {
	resetContainer();
	resetInitialization();
	resetTagServiceProvider();
}

/**
 * Configure dependency injection container with mock repository
 */
function setupContainer(mockRepository: TagRepository) {
	return configureContainer({ customRepository: mockRepository });
}

/**
 * Initialize store with use cases
 */
function initializeStore(container: ReturnType<typeof configureContainer>) {
	const store = useTagStore();
	configureStoreFactory(() => store);
	store.initializeStore(container.useCases);
	return store;
}

/**
 * Setup service provider with mock service
 */
function setupServiceProvider(store: ReturnType<typeof useTagStore>) {
	const mockService = new MockTagService(store);
	configureTagServiceProvider({
		getTagService: () => mockService,
	});
	return mockService;
}

/**
 * Setup test environment with proper dependency injection
 * @param mockRepository - Mock repository to use for testing
 * @returns Configured store and service instances
 */
export function setupTestEnvironment(mockRepository: TagRepository) {
	setupPinia();
	resetDependencies();

	const container = setupContainer(mockRepository);
	const store = initializeStore(container);
	const service = setupServiceProvider(store);

	return {
		store,
		service,
		container,
	};
}

/**
 * Wait for all pending Vue updates and async operations
 * @param wrapper - Vue test wrapper
 * @param timeout - Maximum time to wait in ms
 */
export async function waitForAsyncUpdates(
	wrapper: VueWrapper<Record<string, unknown>>,
	timeout = 100,
): Promise<void> {
	await wrapper.vm.$nextTick();
	// Use a more reliable approach than setTimeout(0)
	await new Promise((resolve) => {
		const start = Date.now();
		const check = () => {
			if (Date.now() - start >= timeout) {
				resolve(undefined);
			} else {
				setTimeout(check, 0);
			}
		};
		check();
	});
}

/**
 * Wait for validation to complete and errors to be displayed
 * @param wrapper - Vue test wrapper
 */
export async function waitForValidation(
	wrapper: VueWrapper<Record<string, unknown>>,
): Promise<void> {
	await waitForAsyncUpdates(wrapper, 50);
}

/**
 * Test timeout constants for consistent timing across tests
 */
export const TEST_TIMEOUTS = {
	VALIDATION_WAIT: 50,
	ASYNC_OPERATION: 100,
	PERFORMANCE_THRESHOLD: Number(process.env.PERF_THRESHOLD_MS) || 1000,
	PERFORMANCE_THRESHOLD_CI: 1500,
} as const;

/**
 * Cleanup test environment
 */
export function cleanupTestEnvironment() {
	resetContainer();
	resetInitialization();
	resetTagServiceProvider();
	vi.clearAllMocks();

	// Reset store state by clearing the Pinia instance
	try {
		const store = useTagStore();
		store.resetState();
		// Reset the use cases to null to allow re-initialization
		(store as TestableStore).useCases = null;
	} catch {
		// Store might not be initialized, ignore error
	}
}
