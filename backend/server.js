const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Enable response compression (Gzip) for better performance
app.use(compression());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
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
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/manager-requests', require('./routes/managerRequestRoutes'));
app.use('/api/managers', require('./routes/managerAccountRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/enrollments', require('./routes/courseEnrollmentRoutes'));
app.use('/api/manager/enrollments', require('./routes/enrollmentManagementRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'WEintegrity API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT);
