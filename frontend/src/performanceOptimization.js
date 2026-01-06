// Performance optimization configuration
// This file can be used to configure performance-related settings

// Disable React Developer Tools in production
if (process.env.NODE_ENV === 'production') {
  // Remove React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = true;
  }
}

// Lazy load console methods to prevent memory leaks
const noop = () => {};
if (process.env.NODE_ENV === 'production') {
  window.console = {
    log: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
  };
}
