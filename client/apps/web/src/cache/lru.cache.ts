/**
		 * LRUCache - A simple, extensible Least Recently Used (LRU) cache with TTL support.
		 *
		 * Stores key-value pairs with automatic eviction of least recently used items
		 * and expiration based on a configurable time-to-live (TTL).
		 *
		 * @template V Type of values stored in the cache.
		 *
		 * @module LRUCache
		 */

		export interface CacheOptions {
		  /** Time to live in milliseconds. Default: 5 minutes */
		  ttl?: number;
		  /** Maximum number of entries. Default: 100 */
		  maxSize?: number;
		}

		export interface CacheStats {
		  /** Current number of entries in the cache */
		  readonly size: number;
		  /** Number of cache hits */
		  readonly hitCount: number;
		  /** Number of cache misses */
		  readonly missCount: number;
		  /** Cache hit rate (0-1) */
		  readonly hitRate: number;
		}

		interface CacheEntry<V> {
		  value: V;
		  lastAccessed: number;
		  createdAt: number;
		}

		/**
		 * LRUCache provides a Map-like API with LRU eviction and TTL expiration.
		 *
		 * - Evicts least recently used items when maxSize is reached.
		 * - Removes expired items based on TTL.
		 * - Tracks cache statistics (hits, misses, hit rate).
		 *
		 * @example
		 * const cache = new LRUCache<string>({ maxSize: 50, ttl: 60000 });
		 * cache.set('foo', 'bar');
		 * const value = cache.get('foo');
		 */
		export class LRUCache<V> {
		  /** Internal storage for cache entries */
		  private readonly cache = new Map<string, CacheEntry<V>>();
		  /** Tracks access order for LRU eviction */
		  private readonly accessOrder = new Set<string>();
		  /** Maximum number of entries allowed in the cache */
		  private readonly maxSize: number;
		  /** Time to live for each entry in milliseconds */
		  private readonly ttl: number;
		  /** Interval for periodic cleanup in milliseconds */
		  private readonly cleanupInterval: number;
		  /** Number of cache hits */
		  private hitCount = 0;
		  /** Number of cache misses */
		  private missCount = 0;
		  /** Timestamp of last cleanup */
		  private lastCleanup = 0;

		  /**
		   * Create a new LRUCache instance.
		   * @param options Cache configuration options
		   */
		  constructor(options: CacheOptions = {}) {
		    this.maxSize = options.maxSize ?? 100;
		    this.ttl = options.ttl ?? 5 * 60 * 1000; // Default 5 min
		    this.cleanupInterval = Math.max(this.ttl / 10, 30_000); // Cleanup every 10% of TTL, min 30s
		  }

		  /**
		   * Retrieve a value from the cache by key.
		   * Updates access order and statistics.
		   * @param key Cache key
		   * @returns The cached value, or undefined if not found or expired
		   */
		  get(key: string): V | undefined {
		    this.maybeCleanup();
		    const entry = this.cache.get(key);
		    if (!entry) {
		      this.missCount++;
		      return undefined;
		    }

		    const now = Date.now();
		    if (now - entry.createdAt > this.ttl) {
		      this.removeEntry(key);
		      this.missCount++;
		      return undefined;
		    }

		    // Update access order efficiently
		    this.updateAccessOrder(key, now);
		    this.hitCount++;
		    return entry.value;
		  }

		  /**
		   * Store a value in the cache.
		   * Evicts the least recently used entry if maxSize is reached.
		   * @param key Cache key
		   * @param value Value to store
		   */
		  set(key: string, value: V): void {
		    const now = Date.now();
		    const isUpdate = this.cache.has(key);

		    // Evict if needed (only for new entries)
		    if (!isUpdate && this.cache.size >= this.maxSize) {
		      this.evictLRU();
		    }

		    // Update access order
		    if (isUpdate) {
		      this.accessOrder.delete(key);
		    }

		    this.cache.set(key, { value, lastAccessed: now, createdAt: now });
		    this.accessOrder.add(key);
		  }

		  /**
		   * Check if a key exists in the cache and is not expired.
		   * @param key Cache key
		   * @returns True if the key exists and is valid, false otherwise
		   */
		  has(key: string): boolean {
		    this.maybeCleanup();
		    const entry = this.cache.get(key);
		    if (!entry) return false;

		    // Check if expired
		    if (Date.now() - entry.createdAt > this.ttl) {
		      this.removeEntry(key);
		      return false;
		    }

		    return true;
		  }

		  /**
		   * Remove a key and its value from the cache.
		   * @param key Cache key
		   * @returns True if the key existed and was removed, false otherwise
		   */
		  delete(key: string): boolean {
		    const existed = this.cache.has(key);
		    if (existed) {
		      this.removeEntry(key);
		    }
		    return existed;
		  }

		  /**
		   * Clear all entries and statistics from the cache.
		   */
		  clear(): void {
		    this.cache.clear();
		    this.accessOrder.clear();
		    this.hitCount = 0;
		    this.missCount = 0;
		    this.lastCleanup = 0;
		  }

		  /**
		   * Get the current number of entries in the cache.
		   */
		  get size(): number {
		    this.maybeCleanup();
		    return this.cache.size;
		  }

		  /**
		   * Evict the least recently used entry from the cache.
		   * @private
		   */
		  private evictLRU(): void {
		    const oldestKey = this.accessOrder.values().next().value;
		    if (oldestKey) {
		      this.removeEntry(oldestKey);
		    }
		  }

		  /**
		   * Remove an entry from the cache and access order.
		   * @param key Cache key
		   * @private
		   */
		  private removeEntry(key: string): void {
		    this.cache.delete(key);
		    this.accessOrder.delete(key);
		  }

		  /**
		   * Update the access order for a key and its last accessed timestamp.
		   * @param key Cache key
		   * @param now Current timestamp
		   * @private
		   */
		  private updateAccessOrder(key: string, now: number): void {
		    this.accessOrder.delete(key);
		    this.accessOrder.add(key);
		    const entry = this.cache.get(key);
		    if (entry) {
		      entry.lastAccessed = now;
		    }
		  }

		  /**
		   * Perform periodic cleanup of expired entries if needed.
		   * @private
		   */
		  private maybeCleanup(): void {
		    const now = Date.now();
		    if (now - this.lastCleanup > this.cleanupInterval) {
		      this.cleanup();
		      this.lastCleanup = now;
		    }
		  }

		  /**
		   * Remove all expired entries from the cache.
		   * @private
		   */
		  private cleanup(): void {
		    const now = Date.now();

		    // Use iterator for better memory efficiency with large caches
		    for (const [key, entry] of this.cache.entries()) {
		      if (now - entry.createdAt > this.ttl) {
		        this.removeEntry(key);
		      }
		    }
		  }

		  /**
		   * Get cache statistics: size, hit/miss counts, and hit rate.
		   * @returns CacheStats object
		   */
		  getStats(): CacheStats {
		    this.maybeCleanup();
		    const total = this.hitCount + this.missCount;
		    return {
		      size: this.cache.size,
		      hitCount: this.hitCount,
		      missCount: this.missCount,
		      hitRate: total > 0 ? this.hitCount / total : 0,
		    } as const;
		  }
		}
