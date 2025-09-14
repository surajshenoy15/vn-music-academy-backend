// controllers/contactController.js
import supabase from "../config/supabase.js";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, subject, message",
      });
    }

    // ✅ Validate preferred_contact
    if (
      preferred_contact &&
      !["email", "phone", "whatsapp"].includes(preferred_contact)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid preferred_contact (must be: email, phone, or whatsapp)",
      });
    }

    // ✅ Insert into Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          phone,
          subject,
          message,
          preferred_contact: preferred_contact || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to save contact message",
        details: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      data,
    });
  } catch (err) {
    console.error("❌ Controller error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
