// routes/contactRoutes.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert([{ name, email, phone, subject, message, preferred_contact }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save contact submission", details: error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
