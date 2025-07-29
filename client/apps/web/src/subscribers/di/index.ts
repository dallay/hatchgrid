/**
 * Dependency injection module exports
 * Provides clean interface for dependency injection configuration
 */

export type {
	ContainerConfig,
	SubscriberContainer,
} from "./container";
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
} from "./container";
export type { InitializationOptions } from "./initialization";
// Initialization exports
export {
	getInitializedStore,
	initializeSubscribersModule,
	initializeWithOptions,
	isSubscribersModuleInitialized,
	resetInitialization,
	safeInitializeSubscribersModule,
} from "./initialization";
