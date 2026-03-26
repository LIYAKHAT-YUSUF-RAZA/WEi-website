const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

// Disable ETags globally - prevents stale proxy/CDN conditional caching
app.disable('etag');

// Generate a unique build ID at server start (changes on each deployment)
const BUILD_ID = crypto.randomBytes(8).toString('hex');
console.log(`Build ID: ${BUILD_ID}`);

// Helper to set aggressive no-cache headers for HTML responses
function setNoCacheHeaders(res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Build-Id', BUILD_ID);
}

// Serve static files from dist directory with smart caching
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Never cache HTML files
      setNoCacheHeaders(res);
    } else {
      // Aggressively cache static assets (JS, CSS, images) for 1 year
      // Safe because Vite adds content hashes to filenames
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  // Never cache the main entry point to ensure users get the latest deployment
  setNoCacheHeaders(res);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
