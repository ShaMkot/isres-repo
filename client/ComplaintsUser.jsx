import React, { useState } from "react";
import axios from "axios";

const ComplaintForm = ({ currentUser }) => {
  const [accusedEmail, setAccusedEmail] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem(`token_${user?.role}`);

      const res = await axios.post(
        "/api/complaints",
        {
          accusedEmail: accusedEmail.trim(),
          description,
          date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ تم إرسال الشكوى بنجاح");
      setAccusedEmail("");
      setDescription("");
      setDate("");
    } catch (err) {
      console.error("فشل الإرسال:", err.message);
      setMessage("❌ حدث خطأ أثناء الإرسال");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">📣 تقديم شكوى</h2>

      {message && <div className="mb-4 text-center text-sm text-blue-600">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">بريد المشكو عليه</label>
          <input
            type="email"
            value={accusedEmail}
            onChange={(e) => setAccusedEmail(e.target.value)}
            required
            placeholder="example@domain.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">وصف الشكوى</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 h-28 resize-none"
            placeholder="اكتب تفاصيل الشكوى هنا..."
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">تاريخ الشكوى</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          إرسال الشكوى
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;
