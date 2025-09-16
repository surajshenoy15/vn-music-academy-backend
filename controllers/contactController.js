// controllers/contactController.js
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";

export const handleContactForm = async (req, res) => {
  try {
    console.log("📥 Incoming form data:", req.body);

    const { name, email, phone, subject, message, preferred_contact } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.warn("⚠️ Validation failed: Missing required fields");
      return res.status(400).json({ error: "Name, email, subject, and message are required." });
    }

    // =========================
    // 1️⃣ Save to Supabase
    // =========================
    const { data, error: supabaseError } = await supabase
      .from("contacts")
      .insert([{ name, email, phone, subject, message, preferred_contact }]);

    if (supabaseError) {
      console.error("❌ Supabase insert error:", supabaseError);
      return res.status(500).json({
        error: "Failed to save form data",
        details: supabaseError.message,
      });
    }

    console.log("✅ Supabase insert successful:", data);

    // =========================
    // 2️⃣ Configure Nodemailer
    // =========================
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // prints detailed logs in terminal
      debug: true,  // prints SMTP conversation in terminal
    });

    // Verify transporter
    transporter.verify((err, success) => {
      if (err) {
        console.error("❌ Nodemailer transporter verification failed:", err);
      } else {
        console.log("✅ Nodemailer transporter ready:", success);
      }
    });

    // =========================
    // 3️⃣ Generate Modern HTML Email
    // =========================
    const htmlEmail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; min-height: 100vh;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(74, 73, 71, 0.1); overflow: hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #4A4947 0%, #5a5856 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                    📧 New Contact Form Submission
                                </h1>
                                <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                    ${new Date().toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                </p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 0;">
                                
                                <!-- Contact Details Section -->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 30px; border-bottom: 1px solid #f0f0f0;">
                                            <h2 style="margin: 0 0 20px 0; color: #4A4947; font-size: 20px; font-weight: 600;">
                                                👤 Contact Information
                                            </h2>
                                            
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #f8f9fa;">
                                                        <strong style="color: #4A4947; font-weight: 600; display: inline-block; width: 140px;">Name:</strong>
                                                        <span style="color: #666; background-color: #f8f9fa; padding: 6px 12px; border-radius: 6px; font-weight: 500;">${name}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #f8f9fa;">
                                                        <strong style="color: #4A4947; font-weight: 600; display: inline-block; width: 140px;">Email:</strong>
                                                        <a href="mailto:${email}" style="color: #4A4947; text-decoration: none; background-color: #f8f9fa; padding: 6px 12px; border-radius: 6px; font-weight: 500;">${email}</a>
                                                    </td>
                                                </tr>
                                                ${phone ? `
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #f8f9fa;">
                                                        <strong style="color: #4A4947; font-weight: 600; display: inline-block; width: 140px;">Phone:</strong>
                                                        <a href="tel:${phone}" style="color: #4A4947; text-decoration: none; background-color: #f8f9fa; padding: 6px 12px; border-radius: 6px; font-weight: 500;">${phone}</a>
                                                    </td>
                                                </tr>
                                                ` : ''}
                                                ${preferred_contact ? `
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #f8f9fa;">
                                                        <strong style="color: #4A4947; font-weight: 600; display: inline-block; width: 140px;">Preferred Contact:</strong>
                                                        <span style="color: #666; background-color: #f8f9fa; padding: 6px 12px; border-radius: 6px; font-weight: 500;">${preferred_contact}</span>
                                                    </td>
                                                </tr>
                                                ` : ''}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Subject Section -->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 30px; border-bottom: 1px solid #f0f0f0;">
                                            <h2 style="margin: 0 0 15px 0; color: #4A4947; font-size: 20px; font-weight: 600;">
                                                🎯 Subject
                                            </h2>
                                            <div style="background: linear-gradient(135deg, #4A4947 0%, #5a5856 100%); color: white; padding: 16px 20px; border-radius: 8px; font-size: 16px; font-weight: 500; letter-spacing: -0.2px;">
                                                ${subject}
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Message Section -->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="margin: 0 0 20px 0; color: #4A4947; font-size: 20px; font-weight: 600;">
                                                💬 Message
                                            </h2>
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #4A4947; padding: 20px; border-radius: 0 8px 8px 0; color: #333; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #4A4947; padding: 25px 30px; text-align: center;">
                                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                    📧 This email was automatically generated from your contact form
                                </p>
                                <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                    Please reply to this email to respond directly to the sender
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    // =========================
    // 4️⃣ Mail options with HTML
    // =========================
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Contact Form"}" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Preferred Contact: ${preferred_contact || "N/A"}

Message:
${message}
      `,
      html: htmlEmail
    };

    // =========================
    // 5️⃣ Send email
    // =========================
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    return res.status(200).json({
      message: "Form submitted successfully and email sent!",
      data,
    });

  } catch (err) {
    console.error("❌ Error in handleContactForm:", err);
    return res.status(500).json({
      error: "Something went wrong",
      details: err.message,
      stack: err.stack, // only in development
    });
  }
};