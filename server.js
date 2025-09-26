// server.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"; // 👈 Added

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// ==================
// CORS setup
// ==================
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3001"
];


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`🚫 CORS blocked request from origin: ${origin}`);
      return callback(new Error("CORS not allowed from this origin"));
    },
    credentials: true,
  })
);

// ==================
// Routes with /api prefix
// ==================
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes); // 👈 Contact routes

// Legacy routes (for backward compatibility)
app.use("/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "VN Music Academy API Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      admin: "/api/admin",
      student: "/api/student",
      payment: "/api/payment/create-order",
      contact: "/api/contact",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    message: "VN Music Academy API Server Running",
    uptime: process.uptime(),
    routes: {
      admin: "/api/admin",
      student: "/api/student",
      payment: "/api/payment/create-order",
      contact: "/api/contact",
    },
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "VN Music Academy API",
    version: "1.0.0",
    available_endpoints: {
      admin: {
        login: "POST /api/admin/login",
        dashboard: "GET /api/admin/dashboard",
      },
      student: {
        sendOtp: "POST /api/student/send-otp",
        verifyOtp: "POST /api/student/verify-otp",
      },
      payment: {
        createOrder: "POST /api/payment/create-order",
        verifyPayment: "POST /api/payment/verify-payment",
      },
      contact: {
        submitForm: "POST /api/contact/submit", // example route
      },
    },
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    requestedUrl: req.originalUrl,
    method: req.method,
    available_endpoints: [
      "POST /api/admin/login",
      "GET /api/admin/dashboard",
      "POST /api/student/send-otp",
      "POST /api/student/verify-otp",
      "POST /api/payment/create-order",
      "POST /api/payment/verify-payment",
      "POST /api/contact/submit",
    ],
  });
});

// General 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    requestedUrl: req.originalUrl,
    method: req.method,
    suggestion: "Check /api for available endpoints",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error:", error);

  if (error.message.includes("CORS not allowed")) {
    return res.status(403).json({
      success: false,
      error: "CORS policy violation",
      message: "This origin is not allowed to access the API",
    });
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

// ==================
// Start server
// ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VN Music Academy API running on port ${PORT}`);
  console.log(`👨‍💼 Admin API: https://vn-music-academy.onrender.com/api/admin`);
  console.log(`🎓 Student API: https://vn-music-academy.onrender.com/api/student`);
  console.log(`💳 Payment API: https://vn-music-academy.onrender.com/api/payment/create-order`);
  console.log(`📩 Contact API: https://vn-music-academy.onrender.com/api/contact`);
  console.log(`❤️  Health Check: https://vn-music-academy.onrender.com/health`);
  console.log(`📋 API Info: https://vn-music-academy.onrender.com/api`);
});

export default app;
