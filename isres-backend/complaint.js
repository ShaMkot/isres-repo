const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // مقدم الشكوى
  email: String,
  accused: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // المشكو عليه
  description: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
