/**
 * middleware/rateLimiter.js
 * Custom lightweight rate limiter — fully Express 5 compatible.
 *
 * express-rate-limit v8 internally mutates req.query which became
 * a getter-only property in Express 5, causing crashes. This implementation
 * uses a plain Map and does not touch any Express internal properties.
 *
 * Design: fixed window per IP address.
 */

/**
 * Creates a rate limiting middleware.
 * @param {number} windowMs  - Window size in milliseconds
 * @param {number} max       - Max requests allowed per window
 * @param {string} message   - Message to send when limit exceeded
 * @param {Function} skip    - Optional function(req) => bool to skip limiting
 */
const createLimiter = (windowMs, max, message, skip) => {
    // Map<ip, { count, resetAt }>
    const store = new Map();

    // Periodically clean expired entries to prevent memory growth
    const cleanup = setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of store.entries()) {
            if (now > entry.resetAt) store.delete(ip);
        }
    }, windowMs);

    // Allow the process to exit cleanly even if this interval is pending
    if (cleanup.unref) cleanup.unref();

    return (req, res, next) => {
        if (skip && skip(req)) return next();

        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        const entry = store.get(ip);

        if (!entry || now > entry.resetAt) {
            // First request in this window
            store.set(ip, { count: 1, resetAt: now + windowMs });
            res.setHeader('RateLimit-Limit', max);
            res.setHeader('RateLimit-Remaining', max - 1);
            res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
            return next();
        }

        entry.count++;
        res.setHeader('RateLimit-Limit', max);
        res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
        res.setHeader('RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

        if (entry.count > max) {
            res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
            return res.status(429).json({ message });
        }

        next();
    };
};

/**
 * Auth routes — brute-force protection.
 * 10 attempts per 15-minute window per IP (only on non-GET requests).
 */
const authLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many login attempts. Limit: 10 per 15 minutes. Please slow down.',
    (req) => req.method === 'GET'
);

/**
 * General API — prevents abuse.
 * 120 requests per minute per IP.
 */
const readLimiter = createLimiter(
    60 * 1000,
    120,
    'Too many requests. Limit: 120 per minute. Please slow down.'
);

/**
 * Write operations — tighter limit.
 * 60 requests per minute per IP (non-GET only).
 */
const writeLimiter = createLimiter(
    60 * 1000,
    60,
    'Too many write requests. Limit: 60 per minute. Please slow down.',
    (req) => req.method === 'GET'
);

module.exports = { authLimiter, writeLimiter, readLimiter };
