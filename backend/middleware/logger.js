/**
 * middleware/logger.js
 * Structured request logger. No external deps.
 * - Logs every request: method, path, status, latency, IP
 * - Flags slow requests (>2s) with a warning
 * - Appends errors to logs/error.log
 */
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const getLogFile = () => {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return path.join(logsDir, `error-${date}.log`);
};

const writeError = (line) => {
    try {
        fs.appendFileSync(getLogFile(), line + '\n');
    } catch (_) {
        // Never crash because of logging failure
    }
};

/**
 * Request logger middleware.
 * Attaches to res.on('finish') so we always capture the final status.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
        const ms = Date.now() - start;
        const { statusCode } = res;
        const slow = ms > 2000;

        const line = `${new Date().toISOString()} ${method} ${originalUrl} ${statusCode} ${ms}ms ${ip}`;

        if (statusCode >= 500) {
            console.error(`❌ ${line}`);
            writeError(`[ERROR] ${line}`);
        } else if (slow) {
            console.warn(`⚠️  SLOW ${line}`);
        } else if (statusCode >= 400) {
            console.warn(`⚠️  ${line}`);
        } else {
            // Only log non-health-check GET requests to avoid noise
            if (originalUrl !== '/api/health') {
                console.log(`   ${line}`);
            }
        }
    });

    next();
};

/**
 * X-Response-Time header middleware.
 * Adds latency info to every response for client-side monitoring.
 */
const responseTime = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        res.setHeader?.('X-Response-Time', `${Date.now() - start}ms`);
    });
    next();
};

module.exports = { requestLogger, writeError };
