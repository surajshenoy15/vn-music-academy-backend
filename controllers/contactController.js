// controllers/contactController.js
import dotenv from "dotenv";
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

dotenv.config();

// -------------------
// Email Transporter (same as OTP)
// -------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------
// Handle Contact Form
// -------------------
export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, subject, message"
      });
    }

    // ✅ Store in Supabase (contacts table)
    const { error: dbError } = await supabase.from("contacts").insert([
      {
        name,
        email,
        phone,
        subject,
        message,
        preferred_contact: preferred_contact || null
      }
    ]);

    if (dbError) {
      console.error("❌ Supabase insert error:", dbError);
      return res.status(500).json({
        success: false,
        error: "Database insert failed",
        details: dbError.message
      });
    }

    // ✅ Email Template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5, #9333ea); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🎵 VN Music Academy</h1>
            <p style="margin: 5px 0 0;">New Contact Form Submission</p>
          </div>
          <div style="padding: 20px;">
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone || "Not provided"}</p>
            <p><b>Subject:</b> ${subject}</p>
            <p><b>Preferred Contact:</b> ${preferred_contact || "Not specified"}</p>
            <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-left: 4px solid #4f46e5;">
              <p style="margin: 0; white-space: pre-line;">${message}</p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 13px; color: #6b7280;">
            <p>🎼 This email was sent automatically by VN Music Academy's contact system.</p>
            <p>Received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    // ✅ Send Email (using same pattern as OTP)
    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`, // SAME AS OTP
        to: process.env.RECEIVER_EMAIL, // Your admin email
        subject: `🎵 New Contact Form: ${subject} - From ${name}`,
        html: htmlTemplate
      });

      console.log("✅ Contact form email sent successfully");
    } catch (sendErr) {
      console.error("❌ Error while sending email:", sendErr);
      return res.status(500).json({
        success: false,
        error: "Email sending failed",
        details: sendErr.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Contact message submitted successfully and email sent"
    });
  } catch (err) {
    console.error("❌ Controller error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message
    });
  }
};
