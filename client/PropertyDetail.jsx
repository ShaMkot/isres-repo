import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import RecommendedProperties from "../components/RecommendedProperties";
import NearbyServices from "../components/NearbyServices";

import Button from "../components/button";
import { Card, CardContent } from "../components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Share2,
  Heart,
  MessageSquare,
  User,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import { Badge } from "../components/badge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/use-toast";

const BASE_URL = "http://localhost:5000/";
const placeholderImage = "https://via.placeholder.com/600x400?text=لا+توجد+صورة";
const createMarkerIcon = (type = "default") => {
  let iconUrl;
  let iconRetinaUrl;
  const shadowUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

  if (type === "property") {
    iconUrl =
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
    iconRetinaUrl =
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
  } else if (type === "service") {
    iconUrl =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
    iconRetinaUrl =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
  } else {
    iconUrl =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
    iconRetinaUrl =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
  }

  return new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};



const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

  const [showSchedule, setShowSchedule] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const getImageUrl = (imgPath) => {
    if (!imgPath) return placeholderImage;
    return imgPath.startsWith("http")
      ? imgPath
      : BASE_URL + imgPath.replace(/^\/+/, "");
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/realestate/${id}`);
        if (!res.ok) throw new Error("فشل في جلب بيانات العقار");
        setProperty(await res.json());
        setActiveImageIndex(0);
      } catch (e) {
        console.error(e);
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    const fetchNearbyServices = async () => {
      if (!property?._id) return;
      try {
        const res = await fetch(
          `${BASE_URL}api/real-estate/${property._id}/services`
        );
        if (!res.ok) throw new Error("فشل في جلب الخدمات القريبة");

        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("خطأ أثناء تحميل الخدمات القريبة:", err);
      }
    };
    fetchNearbyServices();
  }, [property?._id]);

  const handleShowSchedule = () => {
    setShowSchedule((prev) => !prev);
    if (!showSchedule) fetchAppointments();
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointments/available/${id}`
      );
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
      setAppointmentsError("حدث خطأ أثناء جلب المواعيد");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedAppointmentId) return;

    if (!user || !user.token) {
      toast({ title: "يجب تسجيل الدخول أولًا" });
      return;
    }

    try {
      setBookingLoading(true);
      await axios.patch(
        `http://localhost:5000/api/appointments/book/${selectedAppointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast({ title: "تم الحجز بنجاح" });

      setAppointments((prev) =>
        prev.filter((a) => a._id !== selectedAppointmentId)
      );
      setSelectedAppointmentId(null);
      setShowSchedule(false);
    } catch (e) {
      console.error(e);
      toast({ title: "حدث خطأ أثناء الحجز" });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!user || !user.token) {
      alert("يجب تسجيل الدخول لحفظ العقار");
      return;
    }

    try {
      const realEstateId = property._id;

      const response = await axios.post(
        "/api/favorites",
        { realEstateId },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 201) {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ");
    }
  };

  const handleContactOwner = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/conversations/create",
        {
          senderId: user._id,
          receiverId: property.ownerId._id,
        }
      );

      toast({ title: "تم إنشاء المحادثة!" });
      navigate(`/ChatSystem/${response.data._id}`);
    } catch (err) {
      console.error("خطأ أثناء إنشاء المحادثة:", err.response?.data || err.message);
      toast({ title: "حدث خطأ أثناء بدء المحادثة" });
    }
  };

  useEffect(() => {
    async function fetchReviews() {
      if (!property?._id) return;

      try {
        const res = await axios.get(`/api/reviews/${property._id}`);
        setReviews(res.data);

        if (res.data.length > 0) {
          const avg =
            res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
          setAvgRating(avg);
        } else {
          setAvgRating(0);
        }

        if (user) {
          const userRev = res.data.find(
            (r) => (r.userId._id || r.userId) === user._id
          );
          if (userRev) setUserRating(userRev.rating);
        }
      } catch (err) {
        console.error("فشل في جلب التقييمات", err);
      }
    }

    fetchReviews();
  }, [property, user]);

  const submitRating = async (rating, comment = "") => {
    if (!user || !user.token) {
      alert("يجب تسجيل الدخول لتقييم العقار");
      return;
    }

    if (!property || !property._id) {
      alert("العقار غير موجود أو لم يتم تحميله بعد");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "/api/reviews",
        {
          realEstateId: property._id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setUserRating(rating);

      const res = await axios.get(`/api/reviews/${property._id}`);
      setReviews(res.data);
      const avg =
        res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
      setAvgRating(avg);
    } catch (err) {
      alert("حدث خطأ أثناء إرسال التقييم");
      console.error(err);
    }

    setLoading(false);
  };

  const renderLocationDetails = () => {
    const loc = property.location;
    if (!loc) return <p>معلومات الموقع غير متوفرة</p>;
    const hasCoords = loc.latitude && loc.longitude;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {hasCoords && (
            <p>
              الإحداثيات: {loc.latitude}, {loc.longitude}
            </p>
          )}
        </div>
        {hasCoords && (
          <div className="h-96 w-full rounded-md overflow-hidden">
            <MapContainer
              center={[loc.latitude, loc.longitude]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[loc.latitude, loc.longitude]}
                icon={createMarkerIcon()}
              >
                <Popup>
                  {property.title}
                  <br />
                  {loc.address || "لا يوجد عنوان"}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    );
  };

  if (isLoading)
    return <div className="text-center py-12" dir="rtl">جارٍ التحميل...</div>;
  if (!property) {
    return (
      <div
        className="container mx-auto px-4 py-12 text-center"
        dir="rtl"
      >
        <h2 className="text-2xl font-bold mb-4">العقار غير موجود</h2>
        <Link to="/properties">
          <Button>تصفح العقارات</Button>
        </Link>
      </div>
    );
  }

  const renderNearbyServices = () => {
    const loc = property.location;
    if (!loc?.latitude || !loc?.longitude)
      return <p dir="rtl">لا تتوفر إحداثيات العقار</p>;
    if (!services) return <p dir="rtl">جارٍ تحميل الخدمات القريبة...</p>;

    return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h4 className="text-lg font-semibold mb-2">الخدمات القريبة</h4>
          {Object.entries(services).map(([type, items]) => (
            <div key={type} className="mb-4">
              <h5 className="font-medium">{type}</h5>
              <ul className="list-disc pl-6">
                {items.map((s, i) => (
                  <li key={i}>
                    {s.name} - {s.distance.toFixed(2)} كم
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-96 w-full rounded-md overflow-hidden">
          <MapContainer
            center={[loc.latitude, loc.longitude]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[loc.latitude, loc.longitude]}
              icon={createMarkerIcon("blue")}
            >
              <Popup>
                {property.title}
                <br />
                {loc.address || "لا يوجد عنوان"}
              </Popup>
            </Marker>

            {Object.entries(services).map(([type, items]) => {
              if (!items || items.length === 0) return null;

              const closest = items.reduce((prev, curr) =>
                curr.distance < prev.distance ? curr : prev
              );

              return (
                <Marker
                  key={type}
                  position={[closest.lat, closest.lon]}
                  icon={createMarkerIcon("red")}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                    <div>
                      <strong>{closest.name}</strong>
                      <br />
                      النوع: {type}
                      <br />
                      المسافة: {closest.distance.toFixed(2)} كم
                    </div>
                  </Tooltip>

                  <Popup>
                    <strong>{closest.name}</strong>
                    <br />
                    النوع: {type}
                    <br />
                    المسافة: {closest.distance.toFixed(2)} كم
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl" style={{direction:"rtl"}}>
      {/* صور العقار */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {property.images && property.images.length > 0 ? (
            <>
              <div className="relative w-full h-96 rounded-md overflow-hidden">
                <img
                  src={getImageUrl(property.images[activeImageIndex])}
                  alt={`الصورة ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
                <button
                  onClick={() =>
                    setActiveImageIndex((i) =>
                      i === 0 ? property.images.length - 1 : i - 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((i) =>
                      i === property.images.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
                >
                  &gt;
                </button>
              </div>
              <div className="flex mt-2 space-x-2 overflow-x-auto">
                {property.images.map((img, i) => (
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    alt={`صورة مصغرة ${i + 1}`}
                    className={`h-20 w-28 object-cover rounded-md cursor-pointer ${
                      i === activeImageIndex
                        ? "border-2 border-blue-500"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => setActiveImageIndex(i)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-md">
              <p className="text-gray-500">لا توجد صور متاحة</p>
            </div>
          )}

          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-xl text-gray-600 mb-4">
              {new Intl.NumberFormat("ar-EG", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(property.price)}
              {property.listingType === "rent" ? " / شهرياً" : ""}
            </p>

            <div className="flex items-center mt-2 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 cursor-pointer ${
                    star <= userRating
                      ? "text-yellow-500"
                      : star <= Math.round(avgRating)
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }`}
                  onClick={() => submitRating(star)}
                  title={`تقييم ${star} نجوم`}
                />
              ))}
              <span className="text-sm text-gray-600 mr-2">
                {avgRating.toFixed(1)} / 5 ({reviews.length})
              </span>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge variant="outline">{property.propertyType}</Badge>
              <Badge variant="outline">
                {property.listingType === "rent" ? "للإيجار" : "للبيع"}
              </Badge>
            </div>

            <div className="flex gap-4 text-gray-600 mb-4 flex-wrap mt-4">
              <div className="flex items-center gap-1">
                <Bed className="w-5 h-5" />
                {property.features.bedrooms} غرف نوم
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-5 h-5" />
                {property.features.bathrooms} حمامات
              </div>
              <div className="flex items-center gap-1">
                <Square className="w-5 h-5" />
                {property.area} م²
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                {property.address?.city || "غير متوفر"}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">التقييمات والتعليقات</h3>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id || r._id}
                    className="border p-4 rounded-md bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">
                        {r.userId?.fullName || "مستخدم مجهول"}
                      </span>
                      <div className="flex items-center ml-auto space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= r.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {r.comment || "لا يوجد تعليق"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">لا توجد تقييمات حتى الآن.</p>
            )}
          </div>
        </div>

        <div>
          <Card className="p-4" dir="rtl">
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleShowSchedule}>
                {showSchedule ? "إخفاء مواعيد الحجز" : "عرض مواعيد الحجز"}
              </Button>
              {showSchedule && (
                <div className="mt-2 p-4 border rounded max-h-64 overflow-auto bg-white">
                  {loadingAppointments && <p>جارٍ التحميل...</p>}
                  {appointmentsError && (
                    <p className="text-red-600">{appointmentsError}</p>
                  )}
                  {!loadingAppointments && appointments.length === 0 && (
                    <p>لا توجد مواعيد متاحة.</p>
                  )}
                  <ul>
                    {appointments.map((a) => (
                      <li key={a._id} className="mb-2 border-b pb-2">
                        <span>
                          {new Date(a.date).toLocaleDateString("ar-EG")} - {a.time}
                        </span>
                        <Button 
                        className="mx-11"
                          size="sm"
                          variant={
                            selectedAppointmentId === a._id
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSelectedAppointmentId(a._id)}
                        >
                          {selectedAppointmentId === a._id ? "محدد ✅" : "اختيار"}
                        </Button>
                      </li>
                    ))}

                    {appointments.length > 0 && (
                      <div className="mt-4 text-left">
                        <Button
                          disabled={!selectedAppointmentId || bookingLoading}
                          onClick={handleBookAppointment}
                          className="bg-green-600 text-white"
                        >
                          {bookingLoading ? "جارٍ الحجز..." : "تأكيد الحجز"}
                        </Button>
                      </div>
                    )}
                  </ul>
                </div>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={handleContactOwner}
              >
                <MessageSquare className="mr-2" /> تواصل مع المالك
              </Button>

              <Button
                className="w-full"
                variant="ghost"
                onClick={handleSaveProperty}
              >
                <Heart className="mr-2" /> حفظ العقار
              </Button>

              <div className="border-t pt-4 space-y-2" dir="rtl">
                <h3 className="font-semibold">معلومات المالك</h3>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {property.ownerId?.fullName || "غير متوفر"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {property.ownerId?.phoneNumber || "غير متوفر"}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {property.ownerId?.email || "غير متوفر"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-10" dir="rtl">
        <TabsList>
          <TabsTrigger value="details">تفاصيل العقار</TabsTrigger>
          <TabsTrigger value="features">المواصفات</TabsTrigger>
          <TabsTrigger value="location">الموقع</TabsTrigger>
          <TabsTrigger value="contact">الاتصال</TabsTrigger>
          <TabsTrigger value="nearbysevice">الخدمات القريبة</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <h3 className="text-xl font-semibold mb-2">تفاصيل العقار</h3>
          <p>{property.description}</p>
        </TabsContent>

        <TabsContent value="features">
          <h3 className="text-xl font-semibold mb-2">المواصفات</h3>
          <ul className="list-disc pl-5">
            {property.features ? (
              <>
                <li>عدد غرف النوم: {property.features.bedrooms}</li>
                <li>عدد الحمامات: {property.features.bathrooms}</li>
                <li>موقف سيارات: {property.features.parking ? "نعم" : "لا"}</li>
                <li>مؤثث: {property.features.furnished ? "نعم" : "لا"}</li>
              </>
            ) : (
              <li>لا توجد مواصفات مدرجة.</li>
            )}
          </ul>
        </TabsContent>

        <TabsContent value="location">
          <h3 className="text-xl font-semibold mb-2">الموقع</h3>
          {renderLocationDetails()}
        </TabsContent>

        <TabsContent value="contact">
          <h3 className="text-xl font-semibold mb-2">التواصل مع المالك</h3>
          <p>الاسم: {property.ownerId?.fullName || "غير متوفر"}</p>
          <p>الهاتف: {property.ownerId?.phoneNumber || "غير متوفر"}</p>
          <p>البريد الإلكتروني: {property.ownerId?.email || "غير متوفر"}</p>
        </TabsContent>

        <TabsContent value="nearbysevice">
  {Object.keys(services).length === 0 ? (
    <p dir="rtl">جارٍ تحميل الخدمات القريبة...</p>
  ) : (
    <>
      {/* عرض قائمة الخدمات القريبة بشكل منظم وتفاعلي */}
      <NearbyServices services={services} />

      {/* ثم عرض الخريطة مع الخدمات */}
      {property.location?.latitude && property.location?.longitude && (
        <div className="mt-8 h-96 w-full rounded-md overflow-hidden">
          <MapContainer
            center={[property.location.latitude, property.location.longitude]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          {/* مؤشر العقار */}
<Marker
  position={[property.location.latitude, property.location.longitude]}
  icon={createMarkerIcon("property")}
>
  <Popup>
    {property.title}
    <br />
    {property.location.address || "لا يوجد عنوان"}
  </Popup>
</Marker>

{/* مؤشرات الخدمات */}
{Object.entries(services).map(([type, items]) => {
  if (!items || items.length === 0) return null;

  return items.map((service, index) => (
    <Marker
      key={`${type}-${index}`}
      position={[service.lat, service.lon]}
      icon={createMarkerIcon("service")}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div>
          <strong>{service.name}</strong>
          <br />
          النوع: {type}
          <br />
          المسافة: {service.distance.toFixed(2)} كم
        </div>
      </Tooltip>

      <Popup>
        <strong>{service.name}</strong>
        <br />
        النوع: {type}
        <br />
        المسافة: {service.distance.toFixed(2)} كم
      </Popup>
    </Marker>
  ));
})}


          </MapContainer>
        </div>
      )}
    </>
  )}
</TabsContent>

      </Tabs>

      {user && user._id && (
        <div className="mt-12" dir="rtl">
          <RecommendedProperties userId={user._id} />
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
