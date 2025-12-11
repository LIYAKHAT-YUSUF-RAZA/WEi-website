const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
