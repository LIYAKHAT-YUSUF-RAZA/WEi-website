/**
 * Async Handler Middleware
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express error handling middleware.
 * 
 * Usage: router.get('/path', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
