// routes/contactRoutes.js
import express from "express";
import { handleContactForm } from "../controllers/contactController.js";

const router = express.Router();

// Endpoint: POST /api/contact/submit
router.post("/submit", handleContactForm);

export default router;
