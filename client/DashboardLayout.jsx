import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaCalendarCheck,
  FaComments,
  FaBell,
  FaBuilding,
  FaHome,
} from "react-icons/fa";
import { User } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const DashboardLayout = () => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/notifications/unseen/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("فشل جلب عدد الإشعارات:", err);
      }
    };

    fetchUnreadCount();

    if (user?._id) {
      socket.emit("join", user._id);

      socket.on("newNotification", () => {
        setUnreadCount((count) => count + 1);
      });
    }

    return () => {
      socket.off("newNotification");
    };
  }, [token, user]);

  return (
    <div className="min-h-screen grid grid-cols-12" dir="rtl">
      {/* الشريط الجانبي */}
      <aside className="col-span-2 bg-gray-900 text-white p-4 space-y-6">
        <h2 className="text-xl font-bold mb-6 text-right">لوحة المستخدم</h2>
        <nav className="flex flex-col gap-4 text-right">
          <NavLink
            to="statistics"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <FaChartBar className="inline ml-2" /> الإحصائيات
          </NavLink>

          <NavLink
            to="appointments"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <FaCalendarCheck className="inline ml-2" /> المواعيد
          </NavLink>

          <NavLink
            to="complaints"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <FaComments className="inline ml-2" /> الشكاوى
          </NavLink>

          <NavLink
            to="ChatSystem"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <FaComments className="inline ml-2" /> نظام المحادثة
          </NavLink>

          <NavLink
            to="notifications"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 relative"
                : "hover:text-blue-200 relative"
            }
          >
            <FaBell className="inline ml-2" /> الإشعارات
            {unreadCount > 0 && (
              <span className="absolute -top-1 left-0 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="PropertiesOwner"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <FaBuilding className="inline ml-2" /> ممتلكاتي
          </NavLink>

          <NavLink
            to="Profile"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-200"
            }
          >
            <User className="inline ml-2" /> الملف الشخصي
          </NavLink>

          <NavLink to="/home" className="text-sm mt-8 hover:text-red-400">
            <FaHome className="inline ml-2" /> العودة إلى الصفحة الرئيسية
          </NavLink>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="col-span-10 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
