const NodeCache = require('node-cache');

// Cache for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Middleware to cache GET requests
 * @param {number} duration - Cache duration in seconds (optional)
 * @returns {function} - Express middleware
 */
const cacheMiddleware = (duration) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    // Create a unique cache key based on the URL
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
        // console.log(`⚡ Cache Hit: ${req.originalUrl}`);
        res.send(cachedBody);
        return;
    }

    // Capture the original send method
    const originalSend = res.send;
    res.send = (body) => {
        // Check status code, only cache 200 responses
        if (res.statusCode === 200) {
            cache.set(key, body, duration);
        }
        originalSend.call(res, body);
    };

    next();
};

/**
 * Clear cache utility
 * @param {string} keyPattern - Optional pattern to clear specific keys
 */
const clearCache = (keyPattern) => {
    if (keyPattern) {
        const keys = cache.keys();
        const matches = keys.filter(k => k.includes(keyPattern));
        if (matches.length > 0) {
            cache.del(matches);
            // console.log(`Deleted cache keys matching: ${keyPattern}`);
        }
    } else {
        cache.flushAll();
        // console.log('Cache flushed completely');
    }
};

module.exports = { cacheMiddleware, clearCache };
