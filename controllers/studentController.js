// controllers/studentController.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import supabase from "../config/supabase.js";


dotenv.config();

// -------------------
// Email Transporter
// -------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------
// Generate Random OTP
// -------------------
function generateOtp(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

// -------------------
// Request OTP
// -------------------
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

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

    // Send Email
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Your OTP for VN Music Academy Login",
      text: `Hello ${student.name},\n\nYour OTP is: ${otp}\nIt will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.\n\n- VN Music Academy`,
      html: `<p>Hello <b>${student.name}</b>,</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>It will expire in <b>${process.env.OTP_EXPIRY_MINUTES} minutes</b>.</p>
             <p>- VN Music Academy</p>`
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Request OTP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------
// Verify OTP
// -------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Fetch latest OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("student_otps")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return res.status(400).json({ error: "OTP not found" });
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.otp_expires)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Check match
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Fetch student details
    const { data: student } = await supabase
      .from("students")
      .select("id, name, email, course")
      .eq("email", email)
      .single();

    // Issue JWT
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        name: student.name
      },
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
