const RealEstate = require("../models/RealEstate");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");

const getOwnerStatistics = async (req, res) => {
  try {
    const ownerId = req.user._id; // تأكد من أن `req.user._id` يحتوي على ID المستخدم بشكل صحيح

    // ✅ جلب كل العقارات التي يملكها المستخدم
    const estates = await RealEstate.find({ ownerId });

    if (estates.length === 0) {
      return res.status(404).json({ message: "لا توجد عقارات لهذا المستخدم" });
    }

    const statistics = [];

    for (const estate of estates) {
      const realEstateId = estate._id;

      // ✅ معدل التقييمات
      const ratingAgg = await Review.aggregate([
        { $match: { realEstateId: new mongoose.Types.ObjectId(realEstateId) } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
      ]);

      const averageRating = ratingAgg[0]?.average || 0;
      const ratingCount = ratingAgg[0]?.count || 0;

      // ✅ عدد مرات الإضافة للمفضلة
      const favoritesCount = await Favorite.countDocuments({ realEstateId });

      // ✅ عدد الحجوزات (المواعيد المحجوزة فقط)
      const bookingsCount = await Appointment.countDocuments({
        realEstateId,
        status: "booked"
      });

      // إضافة إحصائيات العقار إلى الإحصائيات الكلية
      statistics.push({
        realEstateId,
        title: estate.title,
        averageRating,
        ratingCount,
        favoritesCount,
        bookingsCount
      });
    }

    // ✅ إرجاع الإحصائيات للمستخدم
    res.json(statistics);

  } catch (err) {
    // ✅ معالجة الأخطاء بشكل صحيح
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getOwnerStatistics
};
