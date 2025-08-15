/**
 * Application service for tag operations
 * Provides a clean interface between the application and infrastructure layers
 */

import type { Tag } from "../../domain/models";
import type { CreateTagData, UpdateTagData } from "../../domain/usecases";

/**
 * Interface for tag service operations
 */
export interface TagService {
	// State queries
	getTags(): Tag[];
	isLoading(): boolean;
	hasError(): boolean;
	getError(): Error | null;
	getTagCount(): number;
	isDataLoaded(): boolean;

	// Operations
	fetchTags(): Promise<void>;
	createTag(tagData: CreateTagData): Promise<Tag>;
	updateTag(id: string, tagData: UpdateTagData): Promise<Tag>;
	deleteTag(id: string): Promise<void>;
	refreshTags(): Promise<void>;
	clearError(): void;
	resetState(): void;

	// Queries
	findTagById(id: string): Tag | undefined;
	findTagsByColor(color: string): Tag[];
	getTagsBySubscriberCount(ascending?: boolean): Tag[];
}

/**
 * Service provider interface for dependency injection
 */
export interface TagServiceProvider {
	getTagService(): TagService;
}

// Global service provider instance
let serviceProvider: TagServiceProvider | null = null;

/**
 * Configure the service provider
 * @param provider - The service provider implementation
 */
export function configureTagServiceProvider(
	provider: TagServiceProvider,
): void {
	serviceProvider = provider;
}

/**
 * Get the configured tag service
 * @throws Error if service provider is not configured
 * @returns The tag service instance
 */
export function getTagService(): TagService {
	if (!serviceProvider) {
		throw new Error("Tag service provider must be configured before use");
	}
	return serviceProvider.getTagService();
}

/**
 * Reset the service provider (for testing)
 */
export function resetTagServiceProvider(): void {
	serviceProvider = null;
}
