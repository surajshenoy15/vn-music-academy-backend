// controllers/contactController.js
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // ✅ Store in Supabase
    const { error: dbError } = await supabase.from("contacts").insert([
      { name, email, phone, subject, message, preferred_contact },
    ]);

    if (dbError) {
      console.error("❌ Supabase insert error:", dbError);
      return res.status(500).json({ success: false, error: "Database insert failed" });
    }

    // ✅ Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER, // must be Gmail
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // ✅ Verify transporter
    transporter.verify((err, success) => {
      if (err) {
        console.error("❌ SMTP Verification failed:", err);
      } else {
        console.log("✅ SMTP Server is ready to take messages");
      }
    });

    // ✅ HTML Template
    const htmlTemplate = `
      <h2>🎵 New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone || "N/A"}</p>
      <p><b>Preferred Contact:</b> ${preferred_contact || "N/A"}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b><br>${message}</p>
    `;

    // ✅ Send Email
    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`, // FIXED
        to: process.env.RECEIVER_EMAIL, // your email
        subject: `🎵 New Contact Form: ${subject} - From ${name}`,
        html: htmlTemplate,
      });

      console.log("✅ Email sent successfully");
    } catch (sendErr) {
      console.error("❌ Error while sending email:", sendErr);
      return res.status(500).json({
        success: false,
        error: "Email sending failed",
        details: sendErr.message,
        smtp: sendErr,
      });
    }

    return res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (err) {
    console.error("❌ Unexpected error in handleContactForm:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
