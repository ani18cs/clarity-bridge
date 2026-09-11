/**
 * ClarityBridge — High-Performance In-Memory Cache Utility
 * Provides LRU-style TTL caching for fact-checks, translations, and domain verifications.
 */

class MemoryCache {
  constructor(maxSize = 500, defaultTtlMs = 15 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Set a cached key with value and optional TTL
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs = this.defaultTtlMs) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (LRU)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get value by key, returning null if expired or missing
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order on access
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  /**
   * Check if a valid unexpired key exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get current cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}

const memoryCache = new MemoryCache();

module.exports = {
  MemoryCache,
  memoryCache
};
