const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, getDBStatus } = require('./config/db');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ─── Security Middleware ────────────────────────────────────────────────────
// Helmet sets secure HTTP headers (XSS, clickjacking, CSP, etc.)
app.use(helmet());

// Sanitize request data against NoSQL injection
app.use(mongoSanitize());

// ─── Performance Middleware ─────────────────────────────────────────────────
// Enable response compression (Gzip)
app.use(compression());

// ─── Request Logging ────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Rate Limiting ──────────────────────────────────────────────────────────
// Apply general rate limiter to all routes
app.use(generalLimiter);

// ─── CORS Configuration ────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://dev.weintegrity.com',
  'http://dev.weintegrity.com',
  'https://wei-website-frontend.onrender.com',
  'https://weintegrity-frontend.onrender.com',
  'https://weintegrity.onrender.com',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow any localhost origin (for dynamic Vite ports)
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    console.log('❌ CORS Blocked Origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Request Timeout ────────────────────────────────────────────────────────
// Abort requests that take longer than 30 seconds
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ message: 'Request timeout' });
    }
  });
  next();
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const healthCheck = {
    status: dbStatus.isConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    database: dbStatus,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = dbStatus.isConnected ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// ─── Auth Routes (with strict rate limiting) ────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/manager-requests', require('./routes/managerRequestRoutes'));
app.use('/api/course-requests', require('./routes/courseRequestRoutes'));
app.use('/api/managers', require('./routes/managerAccountRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/enrollments', require('./routes/courseEnrollmentRoutes'));
app.use('/api/manager/enrollments', require('./routes/enrollmentManagementRoutes'));
app.use('/api/service-provider-requests', require('./routes/serviceProviderRequestRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'WEintegrity API Server', status: 'running' });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Log the full error server-side (stdout, not file)
  console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // In production, don't leak error details to the client
  const response = {
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong!'
      : err.message || 'Something went wrong!',
  };

  // Include stack trace in development only
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🛡️  Security: helmet, rate-limiting, mongo-sanitize active`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? '✅ Yes' : '❌ No'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n📡 ${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('🔌 HTTP server closed');

    try {
      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('🗄️  MongoDB connection closed');
    } catch (err) {
      console.error('❌ Error closing MongoDB:', err.message);
    }

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('❌ Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Unhandled Error Safety Nets ────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash — log and continue
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  // Gracefully shut down on uncaught exceptions
  gracefulShutdown('uncaughtException');
});
