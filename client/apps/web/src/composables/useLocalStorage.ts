import { LogManager } from "@hatchgrid/logger";
import { type Ref, ref } from "vue";

/**
 * A composable for persisting reactive state to localStorage
 *
 * @param key - The localStorage key to store the value under
 * @param defaultValue - The default value to use if no value is found in localStorage
 * @param options - Optional configuration options
 * @returns A tuple containing the reactive state and a setter function
 */
const logger = LogManager.getLogger("web:use-local-storage");
export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
	options: {
		serializer?: {
			read: (value: string) => T;
			write: (value: T) => string;
		};
	} = {},
): [Ref<T>, (value: T) => void] {
	const {
		serializer = {
			read: (v: string) => {
				try {
					return JSON.parse(v) as T;
				} catch (e) {
					logger.warn(`Error parsing JSON from localStorage key "${key}"`, {
						error: e,
					});
					return defaultValue;
				}
			},
			write: JSON.stringify,
		},
	} = options;

	function read(): T {
		try {
			const item = localStorage.getItem(key);
			if (item === null) {
				return defaultValue;
			}
			return serializer.read(item);
		} catch (error) {
			logger.warn(`Error reading localStorage key "${key}"`, { error });
			return defaultValue;
		}
	}

	function write(value: T): void {
		try {
			localStorage.setItem(key, serializer.write(value));
		} catch (error) {
			logger.warn(`Error setting localStorage key "${key}"`, { error });
		}
	}

	const storedValue = read();
	const state = ref(storedValue) as Ref<T>;

	function setState(value: T): void {
		state.value = value;
		write(value);
	}

	return [state, setState];
}
