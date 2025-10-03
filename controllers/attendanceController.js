import supabase from "../config/supabase.js";
import { sendMilestoneMail } from "../utils/mailer.js";

// Mark attendance + check for milestone
export const markAttendance = async (req, res) => {
  try {
    const { student_id, date, timing, status, session_name } = req.body;

    // Insert attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance")
      .insert([{ student_id, date, timing, status, session_name }])
      .select();

    if (attendanceError) {
      console.error("❌ Attendance insert error:", attendanceError.message);
      return res.status(400).json({ error: attendanceError.message });
    }

    console.log(`✅ Attendance recorded for student_id: ${student_id}`);

    // Count total sessions for this student
    const { count, error: countError } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student_id);

    if (countError) {
      console.error("❌ Count sessions error:", countError.message);
      return res.status(400).json({ error: countError.message });
    }

    console.log(`📊 Total sessions for student_id ${student_id}: ${count}`);

    // Fetch student info
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("name, email")
      .eq("id", student_id)
      .single();

    if (studentError) {
      console.error("❌ Fetch student error:", studentError.message);
      return res.status(400).json({ error: studentError.message });
    }

    console.log(`👤 Student info: Name=${student.name}, Email=${student.email}`);

    // If milestone reached (multiples of 4) → send mail
    if (count > 0 && count % 4 === 0) {
      console.log(`🎯 Milestone reached for ${student.name} (session ${count})`);
      await sendMilestoneMail(student.email, student.name, count);
      console.log(`📩 Milestone email triggered for ${student.email}`);
    } else {
      console.log(`ℹ️ No milestone for ${student.name} at session ${count}`);
    }

    return res.status(201).json({
      message: "Attendance marked successfully",
      milestoneReached: count % 4 === 0,
      totalSessions: count,
      attendance,
    });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
