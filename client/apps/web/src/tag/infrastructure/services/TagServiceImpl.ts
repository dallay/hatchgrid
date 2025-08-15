/**
 * Infrastructure implementation of the TagService
 * Bridges the application layer with the store
 */

import type { TagService } from "../../application/services/TagService";
import type { Tag } from "../../domain/models";
import type { CreateTagData, UpdateTagData } from "../../domain/usecases";
import { getInitializedStore, safeInitializeTagsModule } from "../di";
import type { TagStore } from "../store/tag.store";

/**
 * Implementation of TagService using the infrastructure store
 */
export class TagServiceImpl implements TagService {
	private store: TagStore;

	constructor() {
		// Ensure module is initialized
		safeInitializeTagsModule();
		this.store = getInitializedStore();
	}

	getTags(): Tag[] {
		return [...this.store.tags]; // Convert readonly array to mutable
	}

	isLoading(): boolean {
		return this.store.isLoading;
	}

	hasError(): boolean {
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

	getTagCount(): number {
		return this.store.tagCount;
	}

	isDataLoaded(): boolean {
		return this.store.isDataLoaded;
	}

	async fetchTags(): Promise<void> {
		await this.store.fetchTags();
	}

	async createTag(tagData: CreateTagData): Promise<Tag> {
		return await this.store.createTag(tagData);
	}

	async updateTag(id: string, tagData: UpdateTagData): Promise<Tag> {
		return await this.store.updateTag(id, tagData);
	}

	async deleteTag(id: string): Promise<void> {
		return await this.store.deleteTag(id);
	}

	async refreshTags(): Promise<void> {
		await this.store.refreshTags();
	}

	clearError(): void {
		this.store.clearError();
	}

	resetState(): void {
		this.store.resetState();
	}

	findTagById(id: string): Tag | undefined {
		return this.store.findTagById(id);
	}

	findTagsByColor(color: string): Tag[] {
		return this.store.findTagsByColor(color);
	}

	getTagsBySubscriberCount(ascending = false): Tag[] {
		return this.store.getTagsBySubscriberCount(ascending);
	}
}
