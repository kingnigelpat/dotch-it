/**
 * In-Memory + SessionStorage Multi-Tier Caching System with TTL.
 * Reduces database read load, speeds up repeat searches, and makes
 * navigation between Home, Search, and Business profiles instantaneous.
 */

const MEMORY_CACHE = new Map()
const PREFIX = 'dotch_cache_'

export const cacheService = {
  /**
   * Retrieve cached data by key.
   * Checks RAM memory cache first for 0ms latency,
   * falls back to sessionStorage, and invalidates expired entries automatically.
   */
  get(key) {
    const prefixedKey = PREFIX + key
    const now = Date.now()

    // 1. Fast RAM check
    if (MEMORY_CACHE.has(prefixedKey)) {
      const entry = MEMORY_CACHE.get(prefixedKey)
      if (entry.expiry > now) {
        return entry.data
      }
      MEMORY_CACHE.delete(prefixedKey)
    }

    // 2. SessionStorage check
    try {
      const raw = sessionStorage.getItem(prefixedKey)
      if (raw) {
        const entry = JSON.parse(raw)
        if (entry.expiry > now) {
          // Re-populate RAM cache
          MEMORY_CACHE.set(prefixedKey, entry)
          return entry.data
        }
        sessionStorage.removeItem(prefixedKey)
      }
    } catch {
      // Storage quota or parsing issues handled safely
    }

    return null
  },

  /**
   * Cache data with a Time-To-Live in seconds.
   * Default: 300 seconds (5 minutes).
   */
  set(key, data, ttlSeconds = 300) {
    const prefixedKey = PREFIX + key
    const expiry = Date.now() + ttlSeconds * 1000
    const entry = { data, expiry }

    // Store in RAM
    MEMORY_CACHE.set(prefixedKey, entry)

    // Store in SessionStorage
    try {
      sessionStorage.setItem(prefixedKey, JSON.stringify(entry))
    } catch (err) {
      // If sessionStorage is full, prune expired items and retry
      try {
        this.pruneExpired()
        sessionStorage.setItem(prefixedKey, JSON.stringify(entry))
      } catch {
        // Fallback: RAM cache still functions
      }
    }
  },

  /**
   * Invalidate a specific cache entry.
   */
  remove(key) {
    const prefixedKey = PREFIX + key
    MEMORY_CACHE.delete(prefixedKey)
    try {
      sessionStorage.removeItem(prefixedKey)
    } catch {
      // ignore
    }
  },

  /**
   * Clear all cache entries matching a prefix or all application caches.
   */
  clear(prefixMatch = '') {
    const target = PREFIX + prefixMatch

    // Clear RAM
    for (const k of MEMORY_CACHE.keys()) {
      if (k.startsWith(target)) {
        MEMORY_CACHE.delete(k)
      }
    }

    // Clear SessionStorage
    try {
      const keysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i)
        if (k && k.startsWith(target)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k))
    } catch {
      // ignore
    }
  },

  /**
   * Prune expired entries from storage.
   */
  pruneExpired() {
    const now = Date.now()
    try {
      const keysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i)
        if (k && k.startsWith(PREFIX)) {
          const raw = sessionStorage.getItem(k)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.expiry <= now) keysToRemove.push(k)
          }
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k))
    } catch {
      // ignore
    }
  },
}
