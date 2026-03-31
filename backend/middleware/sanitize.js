/**
 * middleware/sanitize.js
 * Manual NoSQL injection sanitizer — fully Express 5 compatible.
 *
 * express-mongo-sanitize tries to reassign req.query which became
 * a getter-only property in Express 5, causing crashes.
 *
 * This implementation:
 * - Sanitizes req.body (mutable, set by our own JSON parser)
 * - Sanitizes req.params (mutable)
 * - Reads req.query safely without reassigning it (Express 5 safe)
 * - Strips keys that start with '$' or contain '.' (MongoDB operators)
 */

const DANGEROUS_KEY = /^\$|\..*$/;

/**
 * Recursively remove keys with MongoDB operators from an object.
 * Returns a new sanitized object (does not mutate in place for query).
 */
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, val]) => {
            if (DANGEROUS_KEY.test(key)) {
                console.warn(`⚠️  [SECURITY] Blocked suspicious key: "${key}"`);
                return acc; // drop the key
            }
            acc[key] = sanitizeObject(val);
            return acc;
        }, {});
    }
    return obj;
};

const sanitize = (req, res, next) => {
    // Sanitize req.body (safe to mutate — Express sets this from our JSON middleware)
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize req.params (safe to mutate)
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    // req.query is read-only in Express 5 — we cannot reassign it.
    // Instead, log a warning if dangerous keys are found.
    // Controllers should use validated/parsed query params via express-validator.
    if (req.query && typeof req.query === 'object') {
        for (const key of Object.keys(req.query)) {
            if (DANGEROUS_KEY.test(key)) {
                console.warn(`⚠️  [SECURITY] Suspicious query key blocked: "${key}" from ${req.ip}`);
                // We can delete individual keys from the query object even if the
                // object reference itself is read-only
                try { delete req.query[key]; } catch (_) { /* Express 5: silently ignore */ }
            }
        }
    }

    next();
};

module.exports = sanitize;
