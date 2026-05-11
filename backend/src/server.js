const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/database');
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const mechanicRoutes = require('./routes/mechanics');
const bookingRoutes = require('./routes/bookings');
const inquiryRoutes = require('./routes/inquiries');
const emergencyRoutes = require('./routes/emergency');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const vehicleRoutes = require('./routes/vehicles');
const adminRoutes = require('./routes/admin');
const User = require('./models/User'); // For seeding
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 1574;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, mobile apps) OR any localhost origin
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested from:', req.get('Origin'));
  res.json({ 
    status: 'OK', 
    message: 'Mechanics Hub API is running',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested from:', req.get('Origin'));
  res.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    database: 'Connected to MongoDB Atlas'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Mechanics Hub API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      mechanics: '/api/mechanics',
      bookings: '/api/bookings',
      inquiries: '/api/inquiries',
      emergency: '/api/emergency',
      vehicles: '/api/vehicles',
      health: '/api/health',
      test: '/api/test'
    },
    documentation: 'https://api.mechanicshub.com/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'CORS policy violation',
      error: 'Request not allowed by CORS policy'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      error: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }
  
  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({ 
      message: 'Database error',
      error: 'Database operation failed'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableEndpoints: [
      '/api/auth',
      '/api/services',
      '/api/mechanics',
      '/api/bookings',
      '/api/inquiries',
      '/api/emergency',
      '/api/vehicles',
      '/api/health',
      '/api/test'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔌 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🔌 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🔌 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('🔌 Process terminated');
  });
});

const server = app.listen(PORT, async () => {
  console.log('🚀 Mechanics Hub API Server is running');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: MongoDB Atlas Connected`);

  // Seed default admin account if not exists
  try {
    const adminExists = await User.findOne({ email: 'admin@themechanic.com' });
    if (!adminExists) {
      console.log('Creating default Super Admin account...');
      const admin = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@themechanic.com',
        phone: '1234567890',
        password: 'adminpassword', // Will be hashed by pre-save hook
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Default Super Admin account created: admin@themechanic.com / adminpassword');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
});

module.exports = app;
