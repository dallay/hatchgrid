/**
 * Provider pattern for clean architecture compliance
 * Allows injection of dependencies without direct infrastructure imports
 */

import { type InjectionKey, inject, provide } from "vue";
import type { TagStore } from "../../infrastructure/store";

// Injection key for type safety
export const TAG_STORE_KEY: InjectionKey<TagStore> = Symbol("TagStore");

/**
 * Provide tag store to component tree
 * @param store - The tag store instance
 */
export function provideTagStore(store: TagStore): void {
	provide(TAG_STORE_KEY, store);
}

/**
 * Inject tag store from component tree
 * @returns Tag store instance
 * @throws Error if store not provided
 */
export function injectTagStore(): TagStore {
	const store = inject(TAG_STORE_KEY);
	if (!store) {
		throw new Error(
			"Tag store not provided. Ensure provideTagStore is called in a parent component.",
		);
	}
	return store;
}
