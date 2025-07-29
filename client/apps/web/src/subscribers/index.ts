/**
 * Subscribers module public API
 * Provides clean interface for using the subscribers feature
 */

// Composable exports
export { useSubscribers } from "./composables";
export type { InitializationOptions } from "./di";
// Dependency injection exports
export {
	getInitializedStore,
	initializeSubscribersModule,
	initializeWithOptions,
	isSubscribersModuleInitialized,
	safeInitializeSubscribersModule,
} from "./di";
// Domain model exports
export type {
	Attributes,
	CountByStatusResponse,
	CountByTagsResponse,
	Subscriber,
} from "./domain/models";
export { SubscriberStatus } from "./domain/models";
// Use case exports (for advanced usage)
export type { FetchSubscribersFilters } from "./domain/usecases";

// Presentation component exports
export { default as SubscriberList } from "./presentation/components/SubscriberList.vue";
export { default as SubscriberPage } from "./presentation/views/SubscriberPage.vue";
export type {
	LoadingStates,
	SubscriberError,
	SubscriberStore,
	SubscriberStoreState,
	SubscriberUseCases,
} from "./store/subscriber.store";
// Store exports
export { useSubscriberStore } from "./store/subscriber.store";
