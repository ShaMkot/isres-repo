const Favorite = require("../models/Favorite");

// ✅ إضافة عقار إلى المفضلة
const addToFavorite = async (req, res) => {
  try {
    const { realEstateId } = req.body;
    const userId = req.user._id;

    // تجنّب التكرار
    const exists = await Favorite.findOne({ userId, realEstateId });
    if (exists) return res.status(400).json({ message: "العقار موجود بالفعل في المفضلة" });

    const fav = new Favorite({ userId, realEstateId });
    await fav.save();

    res.status(201).json({ message: "تمت الإضافة إلى المفضلة", favorite: fav });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ حذف عقار من المفضلة
const removeFromFavorite = async (req, res) => {
  try {
    const { realEstateId } = req.params;
    const userId = req.user._id;

    await Favorite.findOneAndDelete({ userId, realEstateId });
    res.json({ message: "تم الحذف من المفضلة" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ عرض قائمة المفضلة الخاصة بالمستخدم
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ userId }).populate("realEstateId");
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ عرض عدد الإعجابات لعقار معين (لصاحب العقار)
//const getFavoritesCount = async (req, res) => {
 // try {
   // const { realEstateId } = req.params;
   // const count = await Favorite.countDocuments({ realEstateId });
    //res.json({ realEstateId, favoritesCount: count });
//} catch (err) {
   // res.status(500).json({ message: err.message });
 // }
//};

module.exports = {
  addToFavorite,
  removeFromFavorite,
  getUserFavorites,
  //getFavoritesCount
};

