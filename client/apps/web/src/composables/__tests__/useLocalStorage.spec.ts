import { LogManager } from "@hatchgrid/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useLocalStorage } from "../useLocalStorage";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("useLocalStorage", () => {
	const defaultValue = { foo: "bar" };

	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorageMock.clear();
	});

	it("returns default value when localStorage is empty", () => {
		const key = "test-key-empty";
		const [state] = useLocalStorage(key, defaultValue);
		expect(state.value).toEqual(defaultValue);
	});

	it("reads and writes value to localStorage", async () => {
		const key = "test-key-write";
		const [state, setState] = useLocalStorage(key, defaultValue);

		setState({ foo: "baz" });
		await nextTick();

		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			key,
			JSON.stringify({ foo: "baz" }),
		);
		expect(state.value).toEqual({ foo: "baz" });
	});

	it("uses custom serializer if provided", async () => {
		const key = "test-key-serializer";
		const serializer = {
			read: (v: string) => ({ value: v }),
			write: (v: { value: string }) => v.value,
		};

		const [state, setState] = useLocalStorage(
			key,
			{ value: "init" },
			{ serializer },
		);

		setState({ value: "custom" });
		await nextTick();

		expect(localStorageMock.setItem).toHaveBeenCalledWith(key, "custom");
		expect(state.value).toEqual({ value: "custom" });
	});

	it("returns parsed value from localStorage if present", () => {
		const key = "test-key-persisted";
		const persistedValue = { foo: "persisted" };

		// Setup the mock to return our value
		localStorageMock.getItem.mockReturnValueOnce(
			JSON.stringify(persistedValue),
		);

		const [state] = useLocalStorage(key, defaultValue);

		expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
		expect(state.value).toEqual(persistedValue);
	});

	it("handles invalid JSON gracefully and returns default value", () => {
		const key = "test-key-invalid-json";
		const logger = LogManager.getLogger("web:use-local-storage");
		const loggerSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

		// Setup the mock to return invalid JSON
		localStorageMock.getItem.mockReturnValueOnce("{invalid-json");

		const [state] = useLocalStorage(key, defaultValue);

		expect(state.value).toEqual(defaultValue);
		expect(loggerSpy).toHaveBeenCalled();
		loggerSpy.mockRestore();
	});

	it("handles localStorage errors gracefully", () => {
		const key = "test-key-error-get";
		const logger = LogManager.getLogger("web:use-local-storage");
		const loggerSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

		// Setup the mock to throw an error
		localStorageMock.getItem.mockImplementationOnce(() => {
			throw new Error("localStorage error");
		});

		const [state] = useLocalStorage(key, defaultValue);

		expect(state.value).toEqual(defaultValue);
		expect(loggerSpy).toHaveBeenCalled();
		loggerSpy.mockRestore();
	});

	it("handles setItem errors gracefully", async () => {
		const key = "test-key-error-set";
		const logger = LogManager.getLogger("web:use-local-storage");
		const loggerSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

		// Setup the mock to throw an error
		localStorageMock.setItem.mockImplementationOnce(() => {
			throw new Error("localStorage error");
		});

		const [, setState] = useLocalStorage(key, defaultValue);

		setState({ foo: "error" });
		await nextTick();

		expect(loggerSpy).toHaveBeenCalled();
		loggerSpy.mockRestore();
	});
});
