import supabase from "../config/supabase.js";

/* ========== ADMIN AUTH ========== */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    res.json({
      message: "✅ Admin logged in",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

/* ========== STUDENT APPLICATIONS ========== */
export const getApplications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_applications")
      .select("*");

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error("Get applications error:", err.message);
    res.status(500).json({ error: "Server error while fetching applications" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from("student_applications")
      .update({ status })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "✅ Application status updated" });
  } catch (err) {
    console.error("Update application error:", err.message);
    res.status(500).json({ error: "Server error while updating application" });
  }
};

/* ========== ATTENDANCE ========== */
export const markAttendance = async (req, res) => {
  try {
    const { student_id, date, status } = req.body;

    const { error } = await supabase
      .from("attendance")
      .insert([{ student_id, date, status }]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "✅ Attendance recorded" });
  } catch (err) {
    console.error("Mark attendance error:", err.message);
    res.status(500).json({ error: "Server error while recording attendance" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from("attendance")
      .update({ status })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "✅ Attendance updated" });
  } catch (err) {
    console.error("Update attendance error:", err.message);
    res.status(500).json({ error: "Server error while updating attendance" });
  }
};

/* ========== FEEDBACK ========== */
export const addFeedback = async (req, res) => {
  try {
    const { student_id, feedback } = req.body;

    const { error } = await supabase
      .from("feedback")
      .insert([{ student_id, feedback }]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "✅ Feedback added" });
  } catch (err) {
    console.error("Add feedback error:", err.message);
    res.status(500).json({ error: "Server error while adding feedback" });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const { error } = await supabase
      .from("feedback")
      .update({ feedback })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "✅ Feedback updated" });
  } catch (err) {
    console.error("Update feedback error:", err.message);
    res.status(500).json({ error: "Server error while updating feedback" });
  }
};
