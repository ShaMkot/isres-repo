import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
  });

  const [ngoFormData, setNgoFormData] = useState({
    ngoName: "",
    description: "",
    services: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNgoChange = (e) => {
    setNgoFormData({ ...ngoFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/user/register", formData);

      if (formData.role === "ngo") {
        const ngoData = {
          user: res.data.user._id,
          name: ngoFormData.ngoName,
          description: ngoFormData.description,
          contact: {
            email: formData.email,
            phone: formData.phoneNumber,
          },
          services: ngoFormData.services
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        };

        await axios.post("http://localhost:5000/api/ngos", ngoData);
      }

      setSuccess("تم التسجيل بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "فشل في عملية التسجيل");
    }
  };

  return (
    <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">إنشاء حساب</h2>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-4 text-center">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="الاسم الكامل"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="البريد الإلكتروني"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
          />

          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="رقم الهاتف"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="كلمة المرور"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-right"
          >
            <option value="">اختر الدور</option>
            <option value="user">مستخدم</option>
            <option value="owner">مالك</option>
            <option value="ngo">جمعية</option>
          </select>

          {formData.role === "ngo" && (
            <>
              <input
                type="text"
                name="ngoName"
                value={ngoFormData.ngoName}
                onChange={handleNgoChange}
                placeholder="اسم الجمعية"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
              />

              <textarea
                name="description"
                value={ngoFormData.description}
                onChange={handleNgoChange}
                placeholder="وصف الجمعية"
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
              />

              <input
                type="text"
                name="services"
                value={ngoFormData.services}
                onChange={handleNgoChange}
                placeholder="الخدمات (مفصولة بفاصلة)"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md"
          >
            تسجيل
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
