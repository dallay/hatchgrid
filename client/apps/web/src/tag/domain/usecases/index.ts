/**
 * Use cases exports
 * Centralized export for all domain use cases
 */

export type { CreateTagData } from "./CreateTag.ts";
export { CreateTag } from "./CreateTag.ts";
export { DeleteTag } from "./DeleteTag.ts";
export { FetchTags } from "./FetchTags.ts";
export type { UpdateTagData } from "./UpdateTag.ts";
export { UpdateTag } from "./UpdateTag.ts";

// Import classes for interface
import type { CreateTag } from "./CreateTag.ts";
import type { DeleteTag } from "./DeleteTag.ts";
import type { FetchTags } from "./FetchTags.ts";
import type { UpdateTag } from "./UpdateTag.ts";

/**
 * Use case dependencies interface for dependency injection
 */
export interface TagUseCases {
	readonly fetchTags: FetchTags;
	readonly createTag: CreateTag;
	readonly updateTag: UpdateTag;
	readonly deleteTag: DeleteTag;
}
