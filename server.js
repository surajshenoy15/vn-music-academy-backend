// server.js (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';

import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js'; // 👈 Added

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true
}));

// ==================
// Razorpay Setup
// ==================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order (for frontend)
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order',
      details: err.message
    });
  }
});

// ==================
// Routes with /api prefix
// ==================
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes); // 👈 Added Student API

// Legacy routes (for backward compatibility)
app.use('/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VN Music Academy API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/api/admin',
      student: '/api/student',
      payment: '/api/payment/create-order'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'VN Music Academy API Server Running',
    uptime: process.uptime(),
    routes: {
      admin: '/api/admin',
      student: '/api/student',
      payment: '/api/payment/create-order'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'VN Music Academy API',
    version: '1.0.0',
    available_endpoints: {
      admin: {
        login: 'POST /api/admin/login',
        dashboard: 'GET /api/admin/dashboard'
      },
      student: {
        sendOtp: 'POST /api/student/send-otp',
        verifyOtp: 'POST /api/student/verify-otp'
      },
      payment: {
        createOrder: 'POST /api/payment/create-order'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'POST /api/admin/login',
      'GET /api/admin/dashboard',
      'POST /api/student/send-otp',
      'POST /api/student/verify-otp',
      'POST /api/payment/create-order'
    ]
  });
});

// General 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    suggestion: 'Check /api for available endpoints'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);

  if (error.message.includes('CORS not allowed')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'This origin is not allowed to access the API'
    });
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VN Music Academy API running on port ${PORT}`);
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`🎓 Student API: http://localhost:${PORT}/api/student`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payment/create-order`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 API Info: http://localhost:${PORT}/api`);
});

export default app;
