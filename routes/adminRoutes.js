import express from "express";
import {
  adminLogin,
  getApplications,
  updateApplicationStatus,
  markAttendance,
  updateAttendance,
  addFeedback,
  updateFeedback,
} from "../controllers/adminController.js";

const router = express.Router();

/* ========== ADMIN AUTH ========== */
router.post("/login", adminLogin);

/* ========== STUDENT APPLICATIONS ========== */
router.get("/applications", getApplications);
router.put("/applications/:id", updateApplicationStatus);

/* ========== ATTENDANCE ========== */
router.post("/attendance", markAttendance);
router.put("/attendance/:id", updateAttendance);

/* ========== FEEDBACK ========== */
router.post("/feedback", addFeedback);
router.put("/feedback/:id", updateFeedback);

export default router;
