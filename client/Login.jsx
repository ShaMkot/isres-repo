import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });
      console.log(res.data);
      const { token, user } = res.data;

      login(user, token);

      localStorage.setItem(`token_${user.role}`, token);
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      setEmail("");
      setPassword("");

      switch (user.role) {
        case "owner":
          navigate("/dashboard");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "ngo":
          navigate("/ngos/dashboard");
          break;
        default:
          navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return (
    <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          تسجيل الدخول
        </h2>

        {error && (
          <div className="mb-4 text-center text-red-600 font-semibold">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-600 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="أدخل بريدك الإلكتروني"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="أدخل كلمة المرور"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            تسجيل الدخول
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            أنشئ حسابًا
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
