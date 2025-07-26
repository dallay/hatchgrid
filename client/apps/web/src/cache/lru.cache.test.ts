import { beforeEach, describe, expect, it } from "vitest";
import { LRUCache } from "./lru.cache";

describe("LRUCache", () => {
	let cache: LRUCache<string, number>;

	beforeEach(() => {
		cache = new LRUCache<string, number>(3);
	});

	it("should return undefined for missing keys", () => {
		expect(cache.get("missing")).toBeUndefined();
	});

	it("should set and get values", () => {
		cache.set("a", 1);
		expect(cache.get("a")).toBe(1);
	});

	it("should update value and move key to most recently used", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.get("a"); // 'a' becomes most recently used
		cache.set("c", 3);
		cache.set("d", 4); // should evict 'b'
		expect(cache.get("b")).toBeUndefined();
		expect(cache.get("a")).toBe(1);
		expect(cache.get("c")).toBe(3);
		expect(cache.get("d")).toBe(4);
	});

	it("should evict least recently used item when at capacity", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		cache.set("d", 4); // 'a' should be evicted
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBe(2);
		expect(cache.get("c")).toBe(3);
		expect(cache.get("d")).toBe(4);
	});

	it("should clear all items", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.clear();
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBeUndefined();
	});

	it("should update value if key already exists", () => {
		cache.set("a", 1);
		cache.set("a", 42);
		expect(cache.get("a")).toBe(42);
	});
});
