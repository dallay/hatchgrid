/**
 * Subscribers module public API
 * Provides clean interface for using the subscribers feature
 */

export type { FetchSubscribersFilters } from "./application";
// Application layer exports (use cases and composables)
export { useSubscribers } from "./application";
// Domain layer exports
export type {
	Attributes,
	CountByStatusResponse,
	CountByTagsResponse,
	Subscriber,
} from "./domain";
export { SubscriberStatus } from "./domain";

// Infrastructure layer exports (store, DI, views)
export type {
	InitializationOptions,
	LoadingStates,
	SubscriberError,
	SubscriberStore,
	SubscriberStoreState,
	SubscriberUseCases,
} from "./infrastructure";
export {
	getInitializedStore,
	initializeSubscribersModule,
	initializeWithOptions,
	isSubscribersModuleInitialized,
	safeInitializeSubscribersModule,
	useSubscriberStore,
} from "./infrastructure";

// View component exports
export { default as SubscriberList } from "./infrastructure/views/components/SubscriberList.vue";
export { default as SubscriberPage } from "./infrastructure/views/views/SubscriberPage.vue";
