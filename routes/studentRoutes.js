// routes/studentRoutes.js
import express from "express";
import {
  requestOtp,
  verifyOtp
} from "../controllers/studentController.js";

const router = express.Router();

/**
 * @route   POST /api/student/send-otp
 * @desc    Request OTP for login
 */
router.post("/send-otp", requestOtp);

/**
 * @route   POST /api/student/verify-otp
 * @desc    Verify OTP and login
 */
router.post("/verify-otp", verifyOtp);

export default router;
