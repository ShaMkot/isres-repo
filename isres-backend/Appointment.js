const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  realEstateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RealEstate",
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // 🕒 مثل "14:00" أو "16:30"
    required: true
  },
  status: {
    type: String,
    enum: ["available", "booked", "cancelled"],
    default: "available"
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
