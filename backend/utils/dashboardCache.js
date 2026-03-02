/**
 * Simple in-memory cache with TTL for dashboard data.
 * Avoids hitting the database on every dashboard page load.
 */
class DashboardCache {
    constructor(ttlMs = 30000) {
        this.cache = new Map();
        this.ttlMs = ttlMs;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }

    set(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    invalidate(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

// Singleton instance — 30 second TTL
module.exports = new DashboardCache(30000);
