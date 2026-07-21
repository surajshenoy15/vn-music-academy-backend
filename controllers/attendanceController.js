import supabase from "../config/supabase.js";
import { sendMilestoneMail } from "../utils/mailer.js";

// Mark attendance and check for milestone
export const markAttendance = async (req, res) => {
  try {
    const {
      student_id,
      date,
      timing,
      status,
      session_name,
    } = req.body;

    const { data: attendance, error: attendanceError } =
      await supabase
        .from("attendance")
        .insert([
          {
            student_id,
            date,
            timing,
            status,
            session_name,
          },
        ])
        .select();

    if (attendanceError) {
      console.error(
        "❌ Attendance insert error:",
        attendanceError.message
      );

      return res.status(400).json({
        error: attendanceError.message,
      });
    }

    console.log(
      `✅ Attendance recorded for student_id: ${student_id}`
    );

    // Count only present sessions
    const { count, error: countError } = await supabase
      .from("attendance")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("student_id", student_id)
      .eq("status", "present");

    if (countError) {
      console.error(
        "❌ Count sessions error:",
        countError.message
      );

      return res.status(400).json({
        error: countError.message,
      });
    }

    console.log(
      `📊 Present sessions for student_id ${student_id}: ${count}`
    );

    const { data: student, error: studentError } =
      await supabase
        .from("students")
        .select("name, email, renewal_date")
        .eq("id", student_id)
        .single();

    if (studentError) {
      console.error(
        "❌ Fetch student error:",
        studentError.message
      );

      return res.status(400).json({
        error: studentError.message,
      });
    }

    console.log(
      `👤 Student: ${student.name}, Email: ${student.email}, Renewal date: ${student.renewal_date}`
    );

    const isPresent =
      status?.toLowerCase() === "present";

    // Triggers at 4, 8, 12, 16...
    const milestoneReached =
      isPresent && count > 0 && count % 4 === 0;

    if (milestoneReached) {
      console.log(
        `🎯 Milestone reached for ${student.name} at session ${count}`
      );

      try {
        await sendMilestoneMail(
          student.email,
          student.name,
          count,
          student.renewal_date
        );

        console.log(
          `📩 Milestone email sent to ${student.email}`
        );
      } catch (mailError) {
        console.error(
          `❌ Attendance saved, but milestone email failed:`,
          mailError
        );
      }
    } else {
      console.log(
        `ℹ️ No milestone for ${student.name} at session ${count}`
      );
    }

    return res.status(201).json({
      message: "Attendance marked successfully",
      milestoneReached,
      totalSessions: count,
      attendance,
    });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};