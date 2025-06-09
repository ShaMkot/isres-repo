const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const createAppointmentSlot = async (req, res) => {
  try {
    const { realEstateId, date, time } = req.body;
    const ownerId = req.user._id;

    console.log("📦 BODY RECEIVED:", req.body);

    const slot = new Appointment({
      realEstateId,
      date,
      time,
      ownerId,
      status: "available"
    });

    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    console.error("❌ Error while creating appointment:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("realEstateId customerId ownerId", "fullName title");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAvailableAppointmentsByRealEstate = async (req, res) => {
  try {
    const realEstateId = req.params.realEstateId;

    const appointments = await Appointment.find({
      realEstateId,
      status: "available"
    }).sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const bookAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const customerId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status !== "available") {
      return res.status(400).json({ message: "This appointment is already booked" });
    }

    appointment.customerId = customerId;
    appointment.status = "booked";
    await appointment.save();

    // إشعار لصاحب العقار
    const notification = new Notification({
      userId: appointment.ownerId,
      content: `تم حجز الموعد بتاريخ ${appointment.date.toLocaleString()}`
    });
    await notification.save();

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const customerId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({ message: "Unauthorized or not booked by you" });
    }

    appointment.status = "available";
    appointment.customerId = null;
    await appointment.save();

    // إشعار لصاحب العقار
    const notification = new Notification({
      userId: appointment.ownerId,
      content: `تم إلغاء الحجز للموعد بتاريخ ${appointment.date.toLocaleString()}`
    });
    await notification.save();

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "الموعد غير موجود" });

    if (appointment.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "غير مسموح لك بحذف هذا الموعد" });
    }

    // ✅ إذا الموعد محجوز، أرسل إشعار للزبون
    if (appointment.status === "booked" && appointment.customerId) {
      const notif = new Notification({
        userId: appointment.customerId,
        content: `تم إلغاء حجزك بتاريخ ${appointment.date.toLocaleDateString()} في الساعة ${appointment.time} من قبل صاحب العقار`
      });
      await notif.save();
    }

    await Appointment.findByIdAndDelete(appointmentId);
    res.json({ message: "تم حذف الموعد بنجاح" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createAppointmentSlot,
  getAllAppointments,
  bookAppointment,
  cancelAppointment,
  deleteAppointment,
  getAvailableAppointmentsByRealEstate
};
