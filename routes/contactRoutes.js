import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, preferred_contact, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ name, email, phone, subject, preferred_contact, message }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save contact submission" });
    }

    res.status(200).json({ message: "Contact saved successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
