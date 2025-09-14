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
      // ✅ Use Gmail service (App Password required)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // must be App Password
        },
      });

      // Verify connection (logs if Gmail rejects credentials)
      transporter.verify((err, success) => {
        if (err) {
          console.error("❌ SMTP verification failed:", err);
        } else {
          console.log("✅ SMTP server is ready to send emails");
        }
      });

      // 🎵 Music Academy Email Design
      const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5, #9333ea); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎵 VN Music Academy</h1>
            <p style="margin: 5px 0 0;">New Contact Form Submission</p>
          </div>
          <div style="padding: 20px;">
            <h2 style="margin-bottom: 10px; color: #111827;">📩 Message Details</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Preferred Contact:</strong> ${preferred_contact || "Not specified"}</p>
            <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-left: 4px solid #4f46e5;">
              <p style="margin: 0; white-space: pre-line;">${message}</p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 14px; color: #6b7280;">
            <p>🎼 This email was sent automatically by VN Music Academy's contact system.</p>
            <p>Received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      `;

      try {
        await transporter.sendMail({
          from: `"🎵 VN Music Academy" <${process.env.EMAIL_USER}>`,
          to: process.env.RECEIVER_EMAIL,
          subject: `🎵 New Contact Form: ${subject} - From ${name}`,
          html: htmlTemplate,
          text: `
🎵 VN MUSIC ACADEMY - New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject}
Preferred Contact: ${preferred_contact || "Not specified"}

Message:
${message}

---
Received on ${new Date().toLocaleString()}
          `,
        });

        console.log(`📧 Email sent successfully to: ${process.env.RECEIVER_EMAIL}`);
      } catch (mailErr) {
        console.error("❌ Email send error:", mailErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Contact message submitted successfully (check logs for email status)",
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
