/**
 * Cache Manager
 * Handles localStorage caching with expiration
 */

class CacheManager {
    /**
     * @param {string} cacheKey - localStorage key
     * @param {number} cacheDuration - Cache duration in milliseconds
     */
    constructor(cacheKey, cacheDuration) {
        this.cacheKey = cacheKey;
        this.cacheDuration = cacheDuration;
    }

    /**
     * Get cached data if it exists and hasn't expired
     * @returns {any|null} Cached data or null if expired/missing
     */
    get() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const { timestamp, data } = JSON.parse(cached);

            // Check if cache has expired
            if (Date.now() - timestamp > this.cacheDuration) {
                this.clear();
                return null;
            }

            // Restore Date objects if they exist
            if (Array.isArray(data)) {
                return data.map(item => {
                    if (item.publishedAt) {
                        return { ...item, publishedAt: new Date(item.publishedAt) };
                    }
                    return item;
                });
            }

            return data;
        } catch {
            return null;
        }
    }

    /**
     * Save data to cache with current timestamp
     * @param {any} data - Data to cache
     */
    set(data) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                data
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            // Silent fail if localStorage is full or unavailable
            console.warn('Failed to save to cache:', error);
        }
    }

    /**
     * Clear cached data
     */
    clear() {
        try {
            localStorage.removeItem(this.cacheKey);
        } catch {
            // Silent fail
        }
    }
}

// Export to global scope for vanilla JS usage
window.CacheManager = CacheManager;
