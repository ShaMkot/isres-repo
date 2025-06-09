const RealEstate = require("../models/RealEstate");
const User = require("../models/User");
const Notification = require("../models/Notification");


const createRealEstate = async (req, res) => {
  try {
    const user = req.user;

    // ✅ تحقق من الحظر
    const currentUser = await User.findById(user._id);
    if (currentUser.isBlocked) {
      return res.status(403).json({ message: "تم حظر حسابك من إضافة العقارات" });
    }

    const address = JSON.parse(req.body.address);
    const features = JSON.parse(req.body.features);
    const location = JSON.parse(req.body.location);
    const imagePaths = req.files ? req.files.map((file) => file.path) : [];

    const newRealEstate = new RealEstate({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      area: Number(req.body.area),
      propertyType: req.body.propertyType,
      listingType: req.body.listingType,
      address,
      features,
      location: {
        latitude: location.latitude || 33.4681,  // دمشق
        longitude: location.longitude || 36.3153
      },
      images: imagePaths,
      ownerId: req.user._id,
      status: "pending"
    });

    await newRealEstate.save();

    // إشعار للأدمن
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        content: `📥 تم تقديم عقار جديد من قبل ${req.user.fullName}`
      });
    }

    res.status(201).json(newRealEstate);
  } catch (error) {
    console.error("❌ خطأ في إنشاء العقار:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
const getAllRealEstates = async (req, res) => {
  try {
    const estates = await RealEstate.find().populate("ownerId", "fullName email");
    res.json(estates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};const getRealEstateById = async (req, res) => {
  try {
    const realEstate = await RealEstate.findById(req.params.id)
      .populate("ownerId", "fullName email phoneNumber");
    if (!realEstate) {
      return res.status(404).json({ message: "العقار غير موجود" });
    }
    res.json(realEstate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateRealEstate = async (req, res) => {
  try {
    const updated = await RealEstate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRealEstate = async (req, res) => {
  try {
    await RealEstate.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRealEstate,
  getAllRealEstates,
  getRealEstateById,
  updateRealEstate,
  deleteRealEstate,
};