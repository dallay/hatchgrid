/**
 * Domain models exports
 * Centralized export for all tag domain models and types
 */

export type {
	CreateTagRequestSchemaType,
	TagResponseSchemaType,
	TagSchemaType,
	UpdateTagRequestSchemaType,
} from "./schemas.ts";
export {
	createTagRequestSchema,
	tagColorsSchema,
	tagResponseSchema,
	tagResponsesArraySchema,
	tagSchema,
	tagsArraySchema,
	updateTagRequestSchema,
} from "./schemas.ts";
export { Tag } from "./Tag.ts";
export { TagColors } from "./TagColors.ts";
export type {
	CreateTagRequest,
	TagResponse,
	UpdateTagRequest,
} from "./TagResponse.ts";
