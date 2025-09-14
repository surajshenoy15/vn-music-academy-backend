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

    // ✅ Send Email Notification with Music Theme Design
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
      console.warn("⚠️ Email env variables not set. Skipping email send.");
    } else {
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 🎵 Music-themed HTML Email Template
      const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form - VN Music Academy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(74, 73, 71, 0.15);">
                  
                  <!-- Header with Musical Notes -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4a4947 0%, #5a5855 100%); padding: 40px 30px; text-align: center; position: relative;">
                      <div style="position: absolute; top: 10px; left: 30px; font-size: 24px; color: rgba(255,255,255,0.3);">♪</div>
                      <div style="position: absolute; top: 20px; right: 40px; font-size: 18px; color: rgba(255,255,255,0.2);">♫</div>
                      <div style="position: absolute; bottom: 15px; left: 50px; font-size: 20px; color: rgba(255,255,255,0.25);">♬</div>
                      <div style="position: absolute; bottom: 25px; right: 30px; font-size: 16px; color: rgba(255,255,255,0.3);">♩</div>
                      
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">
                        🎵 VN MUSIC ACADEMY
                      </h1>
                      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;">
                        NEW CONTACT FORM SUBMISSION
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      
                      <!-- Subject Badge -->
                      <div style="text-align: center; margin-bottom: 30px;">
                        <span style="background: linear-gradient(135deg, #4a4947, #5a5855); color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">
                          📝 ${subject}
                        </span>
                      </div>

                      <!-- Contact Details Grid -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td width="50%" style="padding-right: 15px;">
                            <div style="background: #f8f9fa; border-left: 4px solid #4a4947; padding: 15px; border-radius: 6px;">
                              <h3 style="margin: 0 0 8px 0; color: #4a4947; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                👤 Name
                              </h3>
                              <p style="margin: 0; color: #333; font-size: 16px;">${name}</p>
                            </div>
                          </td>
                          <td width="50%" style="padding-left: 15px;">
                            <div style="background: #f8f9fa; border-left: 4px solid #4a4947; padding: 15px; border-radius: 6px;">
                              <h3 style="margin: 0 0 8px 0; color: #4a4947; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                ✉️ Email
                              </h3>
                              <p style="margin: 0; color: #333; font-size: 16px;">${email}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td width="50%" style="padding-right: 15px;">
                            <div style="background: #f8f9fa; border-left: 4px solid #4a4947; padding: 15px; border-radius: 6px;">
                              <h3 style="margin: 0 0 8px 0; color: #4a4947; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                📱 Phone
                              </h3>
                              <p style="margin: 0; color: #333; font-size: 16px;">${phone || "Not provided"}</p>
                            </div>
                          </td>
                          <td width="50%" style="padding-left: 15px;">
                            <div style="background: #f8f9fa; border-left: 4px solid #4a4947; padding: 15px; border-radius: 6px;">
                              <h3 style="margin: 0 0 8px 0; color: #4a4947; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                🎯 Preferred Contact
                              </h3>
                              <p style="margin: 0; color: #333; font-size: 16px;">${preferred_contact || "Not specified"}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Message Section -->
                      <div style="background: #f8f9fa; border-left: 4px solid #4a4947; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                        <h3 style="margin: 0 0 15px 0; color: #4a4947; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          💬 Message
                        </h3>
                        <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; white-space: pre-line;">${message}</p>
                      </div>

                      <!-- Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #4a4947, #5a5855); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 500; letter-spacing: 0.5px; transition: transform 0.2s;">
                          🎵 Reply to ${name}
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #4a4947; padding: 25px 30px; text-align: center;">
                      <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; letter-spacing: 0.5px;">
                        🎼 Received on ${new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div style="margin-top: 15px; font-size: 20px; color: rgba(255,255,255,0.4);">
                        ♪ ♫ ♬ ♩ ♪
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

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

      console.log(`📧 Music-themed contact form email sent to: ${process.env.RECEIVER_EMAIL}`);
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