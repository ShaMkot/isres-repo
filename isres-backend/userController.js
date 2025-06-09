const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ✅ إنشاء التوكن ويشمل الدور
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role, // ✅ ضروري لتحديد الأدمن
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ تسجيل مستخدم جديد
const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ fullName, email, phoneNumber, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role // ✅ نُرجعه للفرونت
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ تسجيل الدخول
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ تحقق من الحظر
    if (user.isBlocked)
      return res.status(403).json({ message: "تم حظر حسابك من قبل الإدارة" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ تعديل الملف الشخصي
const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const userId = req.user._id;

    const updated = await User.findByIdAndUpdate(
      userId,
      { fullName, phoneNumber },
      { new: true }
    );

    res.json({ message: "تم تعديل الملف الشخصي", user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ حذف الحساب
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "تم حذف الحساب بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount,
};
