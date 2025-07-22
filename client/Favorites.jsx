import React, { useEffect, useState } from "react";
import axios from "axios";
import PropertyCard from '../components/PropertyCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // قراءة بيانات المستخدم من التخزين المحلي
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || !user.role) {
          throw new Error("المستخدم غير مسجل الدخول أو بياناته غير مكتملة");
        }

        // جلب التوكن حسب الدور
        const token = localStorage.getItem(`token_${user.role}`);
        if (!token) {
          throw new Error("التوكن غير موجود، يرجى تسجيل الدخول مجددًا");
        }

        // إرسال الطلب مع رأس التفويض
        const response = await axios.get("/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        setFavorites(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "حدث خطأ أثناء تحميل المفضلة");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) return <p>جارٍ التحميل...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (favorites.length === 0) return <p>لا توجد عقارات محفوظة في المفضلة.</p>;

  return (
    <div>
      <h2 className="text-right text-2xl font-bold mb-6 mx-3">المفضلة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map(({ _id, realEstateId }) => (
          <PropertyCard
            key={_id}
            property={realEstateId}
            user={realEstateId.userId?.fullName} // بيانات المالك
            favorites={favorites}
            setFavorites={setFavorites}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
