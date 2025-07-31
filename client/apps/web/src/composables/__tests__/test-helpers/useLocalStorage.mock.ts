import { vi } from "vitest";
import { ref } from "vue";

/**
 * Creates a mock of the `useLocalStorage` composable.
 *
 * @param initialValue - The initial value for the mocked ref.
 * @returns A mocked `useLocalStorage` function.
 */
export const createUseLocalStorageMock = <T>(initialValue: T | null = null) => {
	const state = ref<T | null>(initialValue);

	const setState = (newValue: T | null) => {
		state.value = newValue;
	};

	const mock = vi.fn(() => [state, setState]);

	return mock as unknown as () => [typeof state, (value: T | null) => void];
};
