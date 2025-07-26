import { beforeEach, describe, expect, it, vi } from "vitest";
import { LRUCache } from "./lru.cache";

describe("LRUCache", () => {
	let cache: LRUCache<string>;

	beforeEach(() => {
		cache = new LRUCache<string>({ maxSize: 3, ttl: 1000 });
		vi.clearAllTimers();
		vi.useFakeTimers();
	});

	describe("basic operations", () => {
		it("should store and retrieve values", () => {
			cache.set("key1", "value1");
			expect(cache.get("key1")).toBe("value1");
		});

		it("should return undefined for non-existent keys", () => {
			expect(cache.get("nonexistent")).toBeUndefined();
		});

		it("should update existing values", () => {
			cache.set("key1", "value1");
			cache.set("key1", "value2");
			expect(cache.get("key1")).toBe("value2");
			expect(cache.size).toBe(1);
		});

		it("should check if key exists", () => {
			cache.set("key1", "value1");
			expect(cache.has("key1")).toBe(true);
			expect(cache.has("nonexistent")).toBe(false);
		});

		it("should delete entries", () => {
			cache.set("key1", "value1");
			expect(cache.delete("key1")).toBe(true);
			expect(cache.has("key1")).toBe(false);
			expect(cache.delete("nonexistent")).toBe(false);
		});
	});

	describe("LRU eviction", () => {
		it("should evict least recently used items when at capacity", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");
			cache.set("key4", "value4"); // Should evict key1

			expect(cache.get("key1")).toBeUndefined();
			expect(cache.get("key2")).toBe("value2");
			expect(cache.get("key3")).toBe("value3");
			expect(cache.get("key4")).toBe("value4");
		});

		it("should update access order on get", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			// Access key1 to make it most recently used
			cache.get("key1");

			cache.set("key4", "value4"); // Should evict key2 (oldest)

			expect(cache.get("key1")).toBe("value1");
			expect(cache.get("key2")).toBeUndefined();
			expect(cache.get("key3")).toBe("value3");
			expect(cache.get("key4")).toBe("value4");
		});
	});

	describe("TTL expiration", () => {
		it("should expire entries after TTL", () => {
			cache.set("key1", "value1");
			expect(cache.get("key1")).toBe("value1");

			// Advance time beyond TTL
			vi.advanceTimersByTime(1001);

			expect(cache.get("key1")).toBeUndefined();
			expect(cache.has("key1")).toBe(false);
		});

		it("should not expire entries before TTL", () => {
			cache.set("key1", "value1");

			// Advance time but not beyond TTL
			vi.advanceTimersByTime(999);

			expect(cache.get("key1")).toBe("value1");
		});
	});

	describe("statistics", () => {
		it("should track hit and miss counts", () => {
			cache.set("key1", "value1");

			cache.get("key1"); // hit
			cache.get("key2"); // miss
			cache.get("key1"); // hit

			const stats = cache.getStats();
			expect(stats.hitCount).toBe(2);
			expect(stats.missCount).toBe(1);
			expect(stats.hitRate).toBe(2 / 3);
		});

		it("should return correct size", () => {
			expect(cache.size).toBe(0);

			cache.set("key1", "value1");
			expect(cache.size).toBe(1);

			cache.set("key2", "value2");
			expect(cache.size).toBe(2);
		});

		it("should handle zero requests gracefully", () => {
			const stats = cache.getStats();
			expect(stats.hitRate).toBe(0);
		});
	});

	describe("cleanup behavior", () => {
		it("should clean up expired entries during normal operations", () => {
			const longTtlCache = new LRUCache<string>({ maxSize: 10, ttl: 10000 });

			longTtlCache.set("key1", "value1");
			longTtlCache.set("key2", "value2");

			// Advance time to expire key1 but not key2
			vi.advanceTimersByTime(5000);
			longTtlCache.set("key3", "value3");

			vi.advanceTimersByTime(6000); // Total 11000ms, key1 and key2 expired

			// Trigger cleanup through get operation
			longTtlCache.get("key3");

			expect(longTtlCache.size).toBe(1);
		});
	});

	describe("clear operation", () => {
		it("should clear all entries and reset stats", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.get("key1"); // Generate some stats

			cache.clear();

			expect(cache.size).toBe(0);

			// Check stats immediately after clear (before any operations)
			let stats = cache.getStats();
			expect(stats.hitCount).toBe(0);
			expect(stats.missCount).toBe(0);

			// Verify entries are actually cleared
			expect(cache.get("key1")).toBeUndefined();

			// After the get operation, miss count should be 1
			stats = cache.getStats();
			expect(stats.hitCount).toBe(0);
			expect(stats.missCount).toBe(1);
		});
	});
});
