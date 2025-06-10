const Review = require("../models/Review");

// ✅ إضافة أو تعديل تقييم
const createOrUpdateReview = async (req, res) => {
  try {
    const { realEstateId, rating, comment } = req.body;
    const userId = req.user._id;

    const existing = await Review.findOne({ userId, realEstateId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return res.json({ message: "تم تحديث التقييم", review: existing });
    }

    const review = new Review({ userId, realEstateId, rating, comment });
    await review.save();
    res.status(201).json({ message: "تم إنشاء التقييم", review });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ جميع التقييمات لعقار معيّن
const getReviewsByRealEstate = async (req, res) => {
  try {
    const { realEstateId } = req.params;
    const reviews = await Review.find({ realEstateId }).populate("userId", "fullName");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ متوسط التقييم لعقار
const getAverageRating = async (req, res) => {
  try {
    const { realEstateId } = req.params;

    const result = await Review.aggregate([
      { $match: { realEstateId: require("mongoose").Types.ObjectId(realEstateId) } },
      { $group: { _id: "$realEstateId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (result.length === 0) return res.json({ averageRating: 0, count: 0 });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { realEstateId } = req.params;

    const review = await Review.findOne({ userId, realEstateId });
    if (!review) return res.status(404).json({ message: "لم يتم العثور على التقييم" });

    await Review.findByIdAndDelete(review._id);
    res.json({ message: "تم حذف التقييم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createOrUpdateReview,
  getReviewsByRealEstate,
  getAverageRating,
  deleteReview

};
