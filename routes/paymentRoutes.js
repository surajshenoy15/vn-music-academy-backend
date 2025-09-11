// routes/paymentRoutes.js
import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Create an order
router.post("/create-order", createOrder);

// Verify payment signature
router.post("/verify-payment", verifyPayment);

export default router;
