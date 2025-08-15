/**
 * Dependency injection module exports
 * Provides clean interface for dependency injection configuration
 */

export type {
	ContainerConfig,
	TagContainer,
} from "./container.ts";
// Container exports
export {
	configureContainer,
	createContainer,
	createRepository,
	createUseCases,
	getCurrentRepository,
	getCurrentUseCases,
	isContainerInitialized,
	resetContainer,
} from "./container.ts";
export type { InitializationOptions } from "./initialization.ts";
// Initialization exports
export {
	configureStoreFactory,
	getInitializedStore,
	initializeTagsModule,
	initializeWithOptions,
	isTagsModuleInitialized,
	resetInitialization,
	safeInitializeTagsModule,
} from "./initialization.ts";
