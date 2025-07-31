
import { ref, type Ref } from "vue";
import { vi } from "vitest";

/**
 * Creates a mock of the `useLocalStorage` composable.
 *
 * @param initialValue - The initial value for the mocked ref.
 * @returns A mocked `useLocalStorage` function.
 */
export const createUseLocalStorageMock = <T>(initialValue: T | null = null) => {
  const state: Ref<T | null> = ref(initialValue);

  const setState = (newValue: T | null) => {
    state.value = newValue;
  };

  const mock = vi.fn(() => [state, setState]);

  return mock as unknown as () => [Ref<T | null>, (value: T | null) => void];
};
