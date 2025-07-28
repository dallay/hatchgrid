// Internal utilities for subscriber store (for testing only)
// Not exported from main store module
import type { LoadingStates, SubscriberError } from "./subscriber.store";

export const errorUtils = {
	create: (message: string, code?: string): SubscriberError => ({
		message,
		code,
		timestamp: new Date(),
	}),
	clear: () => {}, // no-op for test
	set: (_err: SubscriberError) => {}, // no-op for test
};

export const loadingUtils = {
	set: (_key: keyof LoadingStates, _value: boolean) => {}, // no-op for test
	reset: () => {}, // no-op for test
};

export const ensureInitialized = () => {
	throw new Error("Store must be initialized with use cases before use");
};
