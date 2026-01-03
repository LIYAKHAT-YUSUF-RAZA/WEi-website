const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

// Log all requests with timestamp
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Health check endpoint - Define BEFORE static middleware
app.get('/health', (req, res) => {
  const distPath = path.join(__dirname, 'dist');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    distExists: fs.existsSync(distPath),
    distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : []
  });
});

// Favicon handler - check if it exists, otherwise serve default or ignore
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'dist', 'favicon.ico');
  const faviconSvgPath = path.join(__dirname, 'dist', 'favicon.svg');
  
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else if (fs.existsSync(faviconSvgPath)) {
    res.sendFile(faviconSvgPath);
  } else {
    res.status(204).end(); // No content - silently ignore
  }
});

// Serve static files with proper error handling
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  index: false,
  fallthrough: true, // CRITICAL: Allow requests to continue if file not found
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// Catch-all route for SPA - MUST handle ALL non-static routes
app.get('*', (req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`[SPA] ${req.url} -> Serving index.html`);
  
  if (fs.existsSync(indexPath)) {
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return res.sendFile(indexPath);
  } else {
    console.error(`[ERROR] index.html not found at ${indexPath}`);
    return res.status(500).send('Application build not found. Check deployment logs.');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).send('Internal Server Error');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const distPath = path.join(__dirname, 'dist');
  console.log('='.repeat(50));
  console.log(`✓ Frontend Server Started`);
  console.log(`✓ Port: ${PORT}`);
  console.log(`✓ Host: 0.0.0.0 (all interfaces)`);
  console.log(`✓ Dist Path: ${distPath}`);
  console.log(`✓ Dist Exists: ${fs.existsSync(distPath)}`);
  
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`✓ Files in dist: ${files.join(', ')}`);
    console.log(`✓ index.html exists: ${files.includes('index.html')}`);
  }
  
  console.log('='.repeat(50));
  console.log('Server is ready to accept connections!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

