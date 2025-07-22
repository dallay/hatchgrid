import { type Ref, ref, watch } from "vue";

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
			read: (v: string) => JSON.parse(v) as T,
			write: JSON.stringify,
		},
	} = options;

	function read() {
		try {
			const item = localStorage.getItem(key);
			if (item === null) {
				return defaultValue;
			}
			return serializer.read(item);
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return defaultValue;
		}
	}

	function write(value: T) {
		try {
			localStorage.setItem(key, serializer.write(value));
		} catch (error) {
			console.warn(`Error setting localStorage key "${key}":`, error);
		}
	}

	const storedValue = read();
	const state = ref(storedValue) as Ref<T>;

	watch(
		state,
		(newValue: T) => {
			write(newValue);
		},
		{ deep: true },
	);

	function setState(value: T) {
		state.value = value;
	}

	return [state, setState];
}
