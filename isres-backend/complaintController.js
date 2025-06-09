const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ✅ تقديم شكوى من مستخدم ضد مستخدم آخر
const createComplaint = async (req, res) => {
  try {
    const { accused, description, date } = req.body;
    const userId = req.user._id;
    const email = req.user.email;

    const complaint = new Complaint({
      accused,
      description,
      date,
      user: userId,
      email,
    });

    const savedComplaint = await complaint.save();

    // ✅ إرسال إشعار إلى الأدمن
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        content: `🚨 شكوى جديدة مقدّمة من ${req.user.fullName}`,
      });
    }

    res.status(201).json(savedComplaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



module.exports = {
  createComplaint
};
