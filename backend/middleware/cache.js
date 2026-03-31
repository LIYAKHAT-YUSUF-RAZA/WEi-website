/**
 * middleware/cache.js
 * GET response cache middleware using node-cache.
 *
 * Reliability improvement: thundering herd prevention.
 * When the cache expires and many requests arrive simultaneously,
 * only ONE hits the database. The rest wait for the in-flight promise
 * and reuse the same result — no DB stampede.
 *
 * Compatible with Express 5.
 */
const NodeCache = require('node-cache');

// Cache for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

// In-flight request tracking — keyed by cache key
const inFlight = new Map();

/**
 * Middleware to cache GET responses.
 * @param {number} duration - Cache TTL in seconds (optional, defaults to 300)
 */
const cacheMiddleware = (duration) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    // Cache hit — serve immediately
    if (cachedBody !== undefined) {
        res.setHeader('X-Cache', 'HIT');
        res.json(JSON.parse(cachedBody));
        return;
    }

    // Thundering herd: if another request is fetching this key, wait for it
    if (inFlight.has(key)) {
        inFlight.get(key)
            .then((body) => {
                if (!res.headersSent) {
                    res.setHeader('X-Cache', 'WAIT-HIT');
                    res.json(JSON.parse(body));
                }
            })
            .catch(() => {
                if (!res.headersSent) next();
            });
        return;
    }

    // No cache, no in-flight — fetch from DB and populate cache
    let resolveInFlight, rejectInFlight;
    const inFlightPromise = new Promise((resolve, reject) => {
        resolveInFlight = resolve;
        rejectInFlight = reject;
    });
    inFlight.set(key, inFlightPromise);

    // Intercept res.json (Express 5 compatible — res.json is always defined)
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode === 200) {
            const serialized = JSON.stringify(body);
            cache.set(key, serialized, duration);
            resolveInFlight(serialized);
        } else {
            rejectInFlight(new Error('Non-200 response'));
        }
        inFlight.delete(key);
        res.setHeader('X-Cache', 'MISS');
        // Restore and call original
        res.json = originalJson;
        return originalJson(body);
    };

    next();
};

/**
 * Clear cache by key pattern or entirely.
 */
const clearCache = (keyPattern) => {
    if (keyPattern) {
        const matches = cache.keys().filter(k => k.includes(keyPattern));
        if (matches.length > 0) cache.del(matches);
    } else {
        cache.flushAll();
    }
};

module.exports = { cacheMiddleware, clearCache };
