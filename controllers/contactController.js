// controllers/contactController.js
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

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

    // ✅ Send Email Notification
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
      console.warn("⚠️ Email env variables not set. Skipping email send.");
    } else {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,       // sender email (Gmail)
          pass: process.env.EMAIL_PASS,    // app password
        },
      });

      await transporter.sendMail({
        from: `"VN Music Academy" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL,        // admin/receiver email
        subject: `New Contact Form: ${subject}`,
        text: `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Preferred Contact: ${preferred_contact || "Not specified"}

Message:
${message}
        `,
      });

      console.log(`📧 Contact form email sent to: ${process.env.RECEIVER_EMAIL}`);
    }

    return res.status(201).json({
      success: true,
      message: "Contact message submitted successfully and email sent",
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
