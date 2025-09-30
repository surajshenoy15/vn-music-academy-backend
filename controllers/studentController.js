import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import axios from "axios";
import supabase from "../config/supabase.js";

dotenv.config();

// -------------------
// Generate Random OTP
// -------------------
function generateOtp(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

// -------------------
// Send OTP Email via Sendinblue API
// -------------------
async function sendOtpEmail(email, name, otp) {
  const payload = {
    sender: {
      name: process.env.EMAIL_FROM_NAME,
      email: process.env.EMAIL_FROM_ADDRESS
    },
    to: [{ email }],
    subject: "Your Verification Code - VN Music Academy",
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #4A4947; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                      VN Music Academy
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #4A4947; font-size: 24px; font-weight: 600;">
                      Verification Code
                    </h2>
                    
                    <p style="margin: 0 0 25px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Hello <strong style="color: #4A4947;">${name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      We received a request to sign in to your account. Please use the verification code below to complete your login:
                    </p>
                    
                    <!-- OTP Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                      <tr>
                        <td align="center" style="padding: 30px; background-color: #f8f8f8; border: 2px solid #4A4947; border-radius: 8px;">
                          <div style="font-size: 36px; font-weight: 700; color: #4A4947; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                      This code will expire in <strong style="color: #4A4947;">${process.env.OTP_EXPIRY_MINUTES} minutes</strong>. Please do not share this code with anyone.
                    </p>
                    
                    <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      If you did not request this code, please ignore this email or contact our support team if you have concerns.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 30px 40px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                      Best regards,<br>
                      <strong style="color: #4A4947;">VN Music Academy Team</strong>
                    </p>
                    
                    <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  await axios.post("https://api.sendinblue.com/v3/smtp/email", payload, {
    headers: {
      "api-key": process.env.SENDINBLUE_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    timeout: 10000
  });
}

// -------------------
// Request OTP
// -------------------
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (studentError || !student)
      return res.status(404).json({ error: "Student not found" });

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(
      Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000
    ).toISOString();

    // Save OTP in DB
    const { error: otpError } = await supabase
      .from("student_otps")
      .insert([{ email, otp, otp_expires: expiresAt }]);

    if (otpError) {
      console.error("❌ Error saving OTP:", otpError);
      return res.status(500).json({ error: "Failed to save OTP" });
    }

    // Send OTP email
    await sendOtpEmail(email, student.name, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Request OTP Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------
// Verify OTP
// -------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    // Fetch latest OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("student_otps")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord)
      return res.status(400).json({ error: "OTP not found" });

    // Check expiry
    if (new Date() > new Date(otpRecord.otp_expires))
      return res.status(400).json({ error: "OTP expired" });

    // Check match
    if (otpRecord.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    // Fetch student details
    const { data: student } = await supabase
      .from("students")
      .select("id, name, email, course")
      .eq("email", email)
      .single();

    // Issue JWT
    const token = jwt.sign(
      { id: student.id, email: student.email, name: student.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      student
    });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};