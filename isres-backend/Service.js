const mongoose = require('mongoose');

// تعريف الـ Schema لخدمة القريبة
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // اسم الخدمة (مثل "مدرسة" أو "صيدلية")
  type: { type: String, required: true }, // نوع الخدمة (مثل: "amenity", "shop", "leisure")
  lat: { type: Number, required: true }, // خط العرض (للخدمة)
  lon: { type: Number, required: true }, // خط الطول (للخدمة)
  distance: { type: Number, required: true }, // المسافة بين العقار والخدمة (بالكيلومتر أو المتر)
  realEstateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RealEstate', required: true }, // ربط الخدمة بالعقار
  createdAt: { type: Date, default: Date.now }, // تاريخ إنشاء الخدمة
  address: { type: String, required: true }, // عنوان الخدمة
});

// إنشاء نموذج الخدمة
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
