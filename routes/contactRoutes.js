// backend/routes/contact.js
import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { name, email, phone, subject, message, preferred_contact } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const { data, error } = await supabase.from("contacts").insert([
      { name, email, phone, subject, message, preferred_contact }
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Contact submission saved successfully!" });
  } catch (err) {
    console.error("Unexpected backend error:", err);
    return res.status(500).json({ error: "Failed to save contact submission" });
  }
});

export default router;
