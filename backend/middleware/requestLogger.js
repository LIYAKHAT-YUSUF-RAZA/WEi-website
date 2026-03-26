/**
 * Structured Request Logger Middleware
 * Logs method, path, status code, response time, and IP.
 * Uses stdout (not file I/O) for container/cloud-native compatibility.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Listen for response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;

        // Only log API requests, skip health checks to avoid log noise
        if (req.originalUrl === '/api/health') return;

        const logLevel = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';

        console.log(
            `${logLevel} ${req.method} ${req.originalUrl} ${status} ${duration}ms - ${req.ip}`
        );
    });

    next();
};

module.exports = requestLogger;
