import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // 1️⃣ Save to Supabase
    const { data, error } = await supabase
      .from("contact_form")
      .insert([{ name, email, phone, subject, message, preferred_contact }]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({ error: "Failed to save form data" });
    }

    // 2️⃣ Configure Nodemailer transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // sender Gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // 3️⃣ Mail options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`, // sender
      to: process.env.RECEIVER_EMAIL, // admin inbox
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Preferred Contact: ${preferred_contact}

        Message:
        ${message}
      `,
    };

    // 4️⃣ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    res.status(200).json({
      message: "Form submitted successfully, email sent!",
      data,
    });
  } catch (err) {
    console.error("❌ Error in handleContactForm:", err.message);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
};
