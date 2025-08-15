/**
 * Tags module public API
 * Provides clean interface for using the tags feature
 */

// Application layer exports (composables)
export type { UseTagsReturn } from "./application";
export { useTags } from "./application";
// Service provider configuration (application layer)
export {
	configureTagServiceProvider,
	getTagService,
	resetTagServiceProvider,
} from "./application/services/TagService";
// Domain layer exports (models, types, enums)
export type {
	CreateTagRequest,
	CreateTagRequestSchemaType,
	Tag,
	TagResponse,
	TagResponseSchemaType,
	TagSchemaType,
	UpdateTagRequest,
	UpdateTagRequestSchemaType,
} from "./domain";
export {
	createTagRequestSchema,
	TagColors,
	tagColorsSchema,
	tagResponseSchema,
	tagResponsesArraySchema,
	tagSchema,
	tagsArraySchema,
	updateTagRequestSchema,
} from "./domain";
// Infrastructure layer exports (store, DI, initialization)
export type {
	InitializationOptions,
	LoadingStates,
	TagError,
	TagStore,
	TagStoreState,
	TagUseCases,
} from "./infrastructure";
export {
	getInitializedStore,
	initializeTagsModule,
	initializeWithOptions,
	isTagsModuleInitialized,
	safeInitializeTagsModule,
	useTagStore,
} from "./infrastructure";

// View component exports
export { default as DeleteConfirmation } from "./infrastructure/views/components/DeleteConfirmation.vue";
export { default as TagForm } from "./infrastructure/views/components/TagForm.vue";
export { default as TagItem } from "./infrastructure/views/components/TagItem.vue";
export { default as TagList } from "./infrastructure/views/components/TagList.vue";
export { default as TagPage } from "./infrastructure/views/views/TagPage.vue";
