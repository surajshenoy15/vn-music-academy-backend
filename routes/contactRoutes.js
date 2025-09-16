// routes/contactRoutes.js
import express from "express";
import { handleContactForm } from "../controllers/contactController.js";

const router = express.Router();

// POST /api/contact/submit
router.post("/submit", handleContactForm);

export default router;
