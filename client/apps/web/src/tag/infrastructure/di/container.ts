/**
 * Dependency injection container for the tags module
 * Provides factory functions for creating use case instances with injected dependencies
 * Ensures singleton pattern for repository implementations
 */

import type { TagRepository } from "../../domain/repositories/TagRepository.ts";
import {
	CreateTag,
	DeleteTag,
	FetchTags,
	type TagUseCases,
	UpdateTag,
} from "../../domain/usecases";
import { TagApi } from "../api/TagApi.ts";

/**
 * Interface for disposable resources
 */
interface Disposable {
	dispose(): void;
}

/**
 * Container interface for dependency injection
 */
export interface TagContainer {
	readonly repository: TagRepository;
	readonly useCases: TagUseCases;
	readonly _brand: "TagContainer"; // Brand for type safety
}

/**
 * Singleton instance of the repository
 * Ensures single instance across the application
 */
let repositoryInstance: TagRepository | null = null;

/**
 * Singleton instance of use cases
 * Ensures single instance across the application
 */
let useCasesInstance: TagUseCases | null = null;

/**
 * Factory function to create or get the singleton repository instance
 * @returns TagRepository instance
 */
export function createRepository(): TagRepository {
	if (repositoryInstance === null) {
		repositoryInstance = new TagApi();
	}
	// TypeScript assertion: we know repositoryInstance is not null after the check above
	return repositoryInstance as TagRepository;
}

/**
 * Factory function to create or get the singleton use cases with injected dependencies
 * @returns TagUseCases instance with injected repository
 */
export function createUseCases(): TagUseCases {
	if (useCasesInstance === null) {
		const repository = createRepository();

		useCasesInstance = {
			fetchTags: new FetchTags(repository),
			createTag: new CreateTag(repository),
			updateTag: new UpdateTag(repository),
			deleteTag: new DeleteTag(repository),
		};
	}
	return useCasesInstance;
}

/**
 * Factory function to create the complete container with all dependencies
 * @returns TagContainer with repository and use cases
 * @throws Error if container cannot be properly initialized
 */
export function createContainer(): TagContainer {
	const repository = createRepository();
	const useCases = createUseCases();

	// Validate container state
	if (!repository || !useCases) {
		throw new Error("Failed to initialize TagContainer: missing dependencies");
	}

	return {
		repository,
		useCases,
		_brand: "TagContainer" as const,
	};
}

/**
 * Reset all singleton instances (useful for testing)
 * This function should only be used in test environments
 *
 * @param force - Force reset even if instances are in use (use with caution)
 */
export function resetContainer(force = false): void {
	if (force || process.env.NODE_ENV === "test") {
		repositoryInstance = null;
		useCasesInstance = null;
	} else {
		console.warn("resetContainer() should only be called in test environments");
	}
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
	readonly customRepository?: TagRepository;
}

/**
 * Configure the container with custom dependencies (useful for testing)
 *
 * ⚠️ This function should only be called during application startup or in test environments.
 *    If use cases have already been instantiated, this will reset them to ensure consistency.
 *    To avoid inconsistent state, always call `resetContainer()` before reconfiguring in tests,
 *    or use this function before any use case is created.
 *
 * @param config - Configuration options
 * @returns TagContainer with configured dependencies
 */
export function configureContainer(config: ContainerConfig): TagContainer {
	if (config.customRepository) {
		repositoryInstance = config.customRepository;
		// Always reset use cases to force recreation with new repository
		useCasesInstance = null;
	}
	return createContainer();
}

/**
 * Get current repository instance (for testing purposes)
 * @returns Current repository instance or null if not initialized
 */
export function getCurrentRepository(): TagRepository | null {
	return repositoryInstance;
}

/**
 * Get current use cases instance (for testing purposes)
 * @returns Current use cases instance or null if not initialized
 */
export function getCurrentUseCases(): TagUseCases | null {
	return useCasesInstance;
}

/**
 * Dispose of container resources (useful for cleanup)
 * This should be called when the container is no longer needed
 */
export function disposeContainer(): void {
	// Perform any necessary cleanup
	if (repositoryInstance && "dispose" in repositoryInstance) {
		(repositoryInstance as Disposable).dispose();
	}

	resetContainer(true);
}
