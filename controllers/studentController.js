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
    subject: "Your OTP for VN Music Academy Login",
    htmlContent: `
      <p>Hello <b>${name}</b>,</p>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>It will expire in <b>${process.env.OTP_EXPIRY_MINUTES} minutes</b>.</p>
      <p>- VN Music Academy</p>
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
