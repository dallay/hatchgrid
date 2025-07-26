// LRUCache implementation for stable key generation
export class LRUCache<K, V> {
	private cache = new Map<K, V>();
	private maxSize: number;

	constructor(maxSize: number) {
		this.maxSize = maxSize;
	}

	get(key: K): V | undefined {
		const value = this.cache.get(key);
		if (value !== undefined) {
			// Move to end (most recently used)
			this.cache.delete(key);
			this.cache.set(key, value);
		}
		return value;
	}

	set(key: K, value: V): void {
		// Remove if exists to update position
		this.cache.delete(key);
		// Evict least recently used if at capacity
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) this.cache.delete(firstKey);
		}
		this.cache.set(key, value);
	}

	clear(): void {
		this.cache.clear();
	}
}
