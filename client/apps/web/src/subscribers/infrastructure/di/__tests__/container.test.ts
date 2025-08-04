/**
 * Unit tests for dependency injection container
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubscriberRepository } from "@/subscribers/domain";
import {
	CountByStatus,
	CountByTags,
	FetchSubscribers,
} from "@/subscribers/domain";
import { SubscriberApi } from "@/subscribers/infrastructure";
import {
	configureContainer,
	createContainer,
	createRepository,
	createUseCases,
	getCurrentRepository,
	getCurrentUseCases,
	isContainerInitialized,
	resetContainer,
} from "../container";

// Mock the SubscriberApi
vi.mock("../../infrastructure/api/SubscriberApi");

describe("Dependency Injection Container", () => {
	beforeEach(() => {
		resetContainer();
		vi.clearAllMocks();
	});

	describe("createRepository", () => {
		it("should create a SubscriberApi instance", () => {
			const repository = createRepository();
			expect(repository).toBeInstanceOf(SubscriberApi);
		});

		it("should return the same instance on subsequent calls (singleton)", () => {
			const repository1 = createRepository();
			const repository2 = createRepository();
			expect(repository1).toBe(repository2);
		});
	});

	describe("createUseCases", () => {
		it("should create use cases with injected repository", () => {
			const useCases = createUseCases();

			expect(useCases.fetchSubscribers).toBeInstanceOf(FetchSubscribers);
			expect(useCases.countByStatus).toBeInstanceOf(CountByStatus);
			expect(useCases.countByTags).toBeInstanceOf(CountByTags);
		});

		it("should return the same instance on subsequent calls (singleton)", () => {
			const useCases1 = createUseCases();
			const useCases2 = createUseCases();
			expect(useCases1).toBe(useCases2);
		});

		it("should inject the same repository instance into all use cases", () => {
			const repository = createRepository();
			const useCases = createUseCases();

			// Access private repository property for testing
			expect(
				(
					useCases.fetchSubscribers as unknown as {
						repository: SubscriberRepository;
					}
				).repository,
			).toBe(repository);
			expect(
				(
					useCases.countByStatus as unknown as {
						repository: SubscriberRepository;
					}
				).repository,
			).toBe(repository);
			expect(
				(
					useCases.countByTags as unknown as {
						repository: SubscriberRepository;
					}
				).repository,
			).toBe(repository);
		});
	});

	describe("createContainer", () => {
		it("should create a container with repository and use cases", () => {
			const container = createContainer();

			expect(container.repository).toBeInstanceOf(SubscriberApi);
			expect(container.useCases.fetchSubscribers).toBeInstanceOf(
				FetchSubscribers,
			);
			expect(container.useCases.countByStatus).toBeInstanceOf(CountByStatus);
			expect(container.useCases.countByTags).toBeInstanceOf(CountByTags);
		});

		it("should return consistent instances", () => {
			const container1 = createContainer();
			const container2 = createContainer();

			expect(container1.repository).toBe(container2.repository);
			expect(container1.useCases).toBe(container2.useCases);
		});
	});

	describe("resetContainer", () => {
		it("should reset singleton instances", () => {
			const repository1 = createRepository();
			const useCases1 = createUseCases();

			resetContainer();

			const repository2 = createRepository();
			const useCases2 = createUseCases();

			expect(repository1).not.toBe(repository2);
			expect(useCases1).not.toBe(useCases2);
		});
	});

	describe("isContainerInitialized", () => {
		it("should return false initially", () => {
			expect(isContainerInitialized()).toBe(false);
		});

		it("should return true after creating repository and use cases", () => {
			createRepository();
			createUseCases();
			expect(isContainerInitialized()).toBe(true);
		});

		it("should return false after reset", () => {
			createRepository();
			createUseCases();
			resetContainer();
			expect(isContainerInitialized()).toBe(false);
		});
	});

	describe("configureContainer", () => {
		it("should allow custom repository configuration", () => {
			const mockRepository: SubscriberRepository = {
				fetchAll: vi.fn(),
				countByStatus: vi.fn(),
				countByTags: vi.fn(),
			};

			configureContainer({ customRepository: mockRepository });

			const repository = createRepository();
			expect(repository).toBe(mockRepository);
		});

		it("should reset use cases when custom repository is configured", () => {
			// Create initial use cases
			const useCases1 = createUseCases();

			const mockRepository: SubscriberRepository = {
				fetchAll: vi.fn(),
				countByStatus: vi.fn(),
				countByTags: vi.fn(),
			};

			configureContainer({ customRepository: mockRepository });

			// Use cases should be recreated with new repository
			const useCases2 = createUseCases();
			expect(useCases1).not.toBe(useCases2);
			expect(
				(
					useCases2.fetchSubscribers as unknown as {
						repository: SubscriberRepository;
					}
				).repository,
			).toBe(mockRepository);
		});
	});

	describe("getCurrentRepository", () => {
		it("should return null initially", () => {
			expect(getCurrentRepository()).toBeNull();
		});

		it("should return current repository instance", () => {
			const repository = createRepository();
			expect(getCurrentRepository()).toBe(repository);
		});
	});

	describe("getCurrentUseCases", () => {
		it("should return null initially", () => {
			expect(getCurrentUseCases()).toBeNull();
		});

		it("should return current use cases instance", () => {
			const useCases = createUseCases();
			expect(getCurrentUseCases()).toBe(useCases);
		});
	});
});
