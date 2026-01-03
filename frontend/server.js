const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Log all requests with timestamp
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Serve static files with cache headers
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Root health check - CRITICAL for Render
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Build error: index.html not found');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    distFiles: fs.readdirSync(path.join(__dirname, 'dist'))
  });
});

// Catch-all route for SPA - serve index.html for ALL routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`SPA Route: ${req.url} -> Serving index.html`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`ERROR: index.html not found at ${indexPath}`);
    res.status(404).send('Application not built. Please check deployment logs.');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
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

