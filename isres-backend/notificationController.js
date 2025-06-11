const Notification = require("../models/Notification");

// ✅ جلب كل إشعارات المستخدم
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ تعليم الإشعار كمقروء
const markAsSeen = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "الإشعار غير موجود" });

    // فقط صاحب الإشعار يمكنه تحديثه
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "غير مسموح لك" });
    }

    notification.seen = true;
    await notification.save();
    res.json({ message: "تم التعليم كمقروء", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ حذف إشعار
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "الإشعار غير موجود" });

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "غير مسموح لك بالحذف" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الإشعار" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsSeen,
  deleteNotification
};
