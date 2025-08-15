/**
 * Store exports
 * Centralized export for tag store
 */

// Re-export TagUseCases from domain for convenience
export type { TagUseCases } from "../../domain/usecases";
export {
	type LoadingStates,
	type TagError,
	type TagStore,
	type TagStoreState,
	useTagStore,
} from "./tag.store.ts";
