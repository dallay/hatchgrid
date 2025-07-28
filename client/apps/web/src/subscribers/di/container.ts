/**
 * Dependency injection container for the subscribers module
 * Provides factory functions for creating use case instances with injected dependencies
 * Ensures singleton pattern for repository implementations
 */

import type { SubscriberRepository } from "../domain/repositories/SubscriberRepository";
import {
	CountByStatus,
	CountByTags,
	FetchSubscribers,
} from "../domain/usecases";
import { SubscriberApi } from "../infrastructure/api/SubscriberApi";
import type { SubscriberUseCases } from "../store/subscriber.store";

/**
 * Container interface for dependency injection
 */
export interface SubscriberContainer {
	readonly repository: SubscriberRepository;
	readonly useCases: SubscriberUseCases;
}

/**
 * Singleton instance of the repository
 * Ensures single instance across the application
 */
let repositoryInstance: SubscriberRepository | null = null;

/**
 * Singleton instance of use cases
 * Ensures single instance across the application
 */
let useCasesInstance: SubscriberUseCases | null = null;

/**
 * Factory function to create or get the singleton repository instance
 * @returns SubscriberRepository instance
 */
export function createRepository(): SubscriberRepository {
	if (repositoryInstance === null) {
		repositoryInstance = new SubscriberApi();
	}
	return repositoryInstance;
}

/**
 * Factory function to create or get the singleton use cases with injected dependencies
 * @returns SubscriberUseCases instance with injected repository
 */
export function createUseCases(): SubscriberUseCases {
	if (useCasesInstance === null) {
		const repository = createRepository();

		useCasesInstance = {
			fetchSubscribers: new FetchSubscribers(repository),
			countByStatus: new CountByStatus(repository),
			countByTags: new CountByTags(repository),
		};
	}
	return useCasesInstance;
}

/**
 * Factory function to create the complete container with all dependencies
 * @returns SubscriberContainer with repository and use cases
 */
export function createContainer(): SubscriberContainer {
	const repository = createRepository();
	const useCases = createUseCases();

	return {
		repository,
		useCases,
	};
}

/**
 * Reset all singleton instances (useful for testing)
 * This function should only be used in test environments
 */
export function resetContainer(): void {
	repositoryInstance = null;
	useCasesInstance = null;
}

/**
 * Check if container has been initialized
 * @returns true if container is initialized, false otherwise
 */
export function isContainerInitialized(): boolean {
	return repositoryInstance !== null && useCasesInstance !== null;
}

/**
 * Configuration options for the container
 */
export interface ContainerConfig {
	readonly customRepository?: SubscriberRepository;
}

/**
 * Configure the container with custom dependencies (useful for testing)
 * @param config - Configuration options
 */
export function configureContainer(config: ContainerConfig): void {
	if (config.customRepository) {
		repositoryInstance = config.customRepository;
		// Reset use cases to force recreation with new repository
		useCasesInstance = null;
	}
}

/**
 * Get current repository instance (for testing purposes)
 * @returns Current repository instance or null if not initialized
 */
export function getCurrentRepository(): SubscriberRepository | null {
	return repositoryInstance;
}

/**
 * Get current use cases instance (for testing purposes)
 * @returns Current use cases instance or null if not initialized
 */
export function getCurrentUseCases(): SubscriberUseCases | null {
	return useCasesInstance;
}
