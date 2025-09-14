import nodemailer from "nodemailer";
import { supabase } from "../supabaseClient.js";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferredContact } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Save into Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{
        name,
        email,
        phone,
        subject,
        message,
        preferred_contact: preferredContact
      }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save message" });
    }

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // vnmusicacademy.official@gmail.com
        pass: process.env.EMAIL_PASS   // Gmail app password
      }
    });

    const mailOptions = {
      from: `"VN Music Academy" <${process.env.EMAIL_USER}>`,
      to: "surajshenoyp@gmail.com",
      subject: `New Contact Form Submission - ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent and stored successfully" });

  } catch (err) {
    console.error("Error in handleContactForm:", err);
    res.status(500).json({ error: "Server error" });
  }
};
