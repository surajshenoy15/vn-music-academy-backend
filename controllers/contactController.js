// controllers/contactController.js
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    // Insert into Supabase
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ name, email, phone, subject, message, preferred_contact }]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save form data." });
    }

    console.log("✅ Data stored in Supabase:", data);

    // Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // must match .env
        pass: process.env.EMAIL_PASS, // App password if using Gmail
      },
    });

    console.log("📨 Email Config ->", process.env.EMAIL_USER);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // your receiving email
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Preferred Contact: ${preferred_contact}
        
        Message: ${message}
      `,
    };

    // Send mail
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Error sending email:", err);
        return res.status(500).json({ error: "Failed to send email." });
      }
      console.log("✅ Email sent:", info.response);
      return res.status(200).json({ success: true, message: "Form submitted successfully." });
    });
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
