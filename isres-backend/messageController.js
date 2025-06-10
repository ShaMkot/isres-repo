const Message = require("../models/Message");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// ✅ 1. حفظ رسالة (تستخدمها REST و WebSocket)
const saveMessage = async ({ senderId, receiverId, realEstateId, content })  => {
  const message = new Message({
    senderId,
    receiverId,
    realEstateId: realEstateId || null,
    content
  });

  const saved = await message.save();

  // إنشاء إشعار للطرف الآخر
  await Notification.create({
    userId: receiverId,
    content: "📨 لديك رسالة جديدة"
  });

  return saved;
};

// ✅ 2. إرسال رسالة عبر REST
const sendMessage = async (req, res) => {
  try {
    const { receiverId, realEstateId, content } = req.body;
    
    const senderId = req.user._id;

    const saved = await saveMessage({ senderId, receiverId, realEstateId, content });
    res.status(201).json({ message: "تم إرسال الرسالة", data: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ 3. جلب محادثة لعقار معيّن بين شخصين
const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { realEstateId, otherUserId } = req.params;

    const messages = await Message.find({
      realEstateId,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ 4. جلب محادثة بدون عقار (مثل الجمعية)
const getDirectConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      realEstateId: null,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ 5. حذف محادثة مرتبطة بعقار
/*const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId, realEstateId } = req.params;

    await Message.deleteMany({
      realEstateId,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    });

    res.json({ message: "تم حذف المحادثة المرتبطة بالعقار" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

// ✅ 6. حذف محادثة عامة (بدون عقار)
/*const deleteDirectConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    await Message.deleteMany({
      realEstateId: null,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    });

    res.json({ message: "تم حذف المحادثة العامة" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

// ✅ 7. عدد الرسائل غير المقروءة من شخص معيّن
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromUserId } = req.params;

    const count = await Message.countDocuments({
      receiverId: userId,
      senderId: fromUserId,
      seen: false
    });

    res.json({ from: fromUserId, unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getDirectConversation,
  //deleteConversation,
  //deleteDirectConversation,
  saveMessage,
  getUnreadCount
};
