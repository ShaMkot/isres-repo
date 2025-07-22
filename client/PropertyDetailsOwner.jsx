import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup,Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

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
const placeholderImage = "https://via.placeholder.com/600x400?text=No+Image";

const createMarkerIcon = () =>
  new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

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
        if (!res.ok) throw new Error("Failed to fetch property");
        setProperty(await res.json());
        setActiveImageIndex(0);
        console.log(res.realestateId);
      

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
      const res = await fetch(`${BASE_URL}api/real-estate/${property._id}/services`);
      if (!res.ok) throw new Error("Failed to fetch nearby services");
      console.log("Nearby services data:", );

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
      console.log("📅 المواعيد:", res.data);
      
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
    console.log("👉 selectedAppointmentId:", selectedAppointmentId);
   console.log("👉 user:", user);
    console.log("👉 user?.token:", user?.token);

if (!user || !user.token) {
  toast({ title: "يجب تسجيل الدخول أولًا" });
  return;
}

    try {
      setBookingLoading(true);
      const res = await axios.patch(
        `http://localhost:5000/api/appointments/book/${selectedAppointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // استخدام user من useAuth
          },
        }
      );

      toast({ title: "تم الحجز بنجاح" });

      // إزالة الموعد من القائمة بعد الحجز
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
          Authorization: `Bearer ${user.token}`, // ✅ استخدام التوكن من السياق
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
    const response = await axios.post("http://localhost:5000/api/conversations/create", {
      senderId: user._id,                 // ✅ أرسل المعرف فقط
      receiverId: property.ownerId._id    // ✅ أرسل المعرف فقط (إذا كان ownerId كائنًا)
    });

    toast({ title: "تم إنشاء المحادثة!" });
    navigate(`/ChatSystem/${response.data._id}`);
    console.log("Conversation ID:", response.data._id);

  } catch (err) {
    console.error("Error creating conversation:", err.response?.data || err.message);
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
        const avg = res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
        setAvgRating(avg);
      } else {
        setAvgRating(0);
      }

      if (user) {
        const userRev = res.data.find(r =>
          (r.userId._id || r.userId) === user._id
        );
        if (userRev) setUserRating(userRev.rating);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  }

  fetchReviews();
}, [property, user]);  // هنا عدلت dependency ليكون property كاملاً وليس property._id
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
        comment,  // إرسال التعليق مع التقييم
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setUserRating(rating);

    // إعادة تحميل التقييمات بعد التقييم
    const res = await axios.get(`/api/reviews/${property._id}`);
    setReviews(res.data);
    const avg = res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
    setAvgRating(avg);
  } catch (err) {
    alert("حدث خطأ أثناء إرسال التقييم");
    console.error(err);
  }

  setLoading(false);
};




  const renderLocationDetails = () => {
    const loc = property.location;
    if (!loc) return <p>Location information not available</p>;
    const hasCoords = loc.latitude && loc.longitude;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {hasCoords && (
            <p>
              Coordinates: {loc.latitude}, {loc.longitude}
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
                  {loc.address || "No address"}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <Link to="/properties">
          <Button>Browse Properties</Button>
        </Link>
      </div>
    );
  }
  
const renderNearbyServices = () => {
  const loc = property.location;
  if (!loc?.latitude || !loc?.longitude) return <p>لا تتوفر إحداثيات العقار</p>;
  if (!services) return <p>جارٍ تحميل الخدمات القريبة...</p>;

  return (
    <div className="space-y-6">
      {/* قائمة نصية */}
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

      {/* خريطة بالدبابيس */}
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

          {/* دبوس العقار */}
          <Marker
            position={[loc.latitude, loc.longitude]}
            icon={createMarkerIcon("blue")}
          >
            <Popup>
              {property.title}
              <br />
              {loc.address || "No address"}
            </Popup>
          </Marker>

          {/* دبابيس أقرب خدمة من كل نوع */}
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
                {/* يظهر عند المرور */}
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <div>
                    <strong>{closest.name}</strong><br />
                    النوع: {type}<br />
                    المسافة: {closest.distance.toFixed(2)} كم
                  </div>
                </Tooltip>
 
                {/* يظهر عند النقر */}
                <Popup>
                  <strong>{closest.name}</strong><br />
                  النوع: {type}<br />
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
    <div className="container mx-auto px-4 py-8">
      {/* صور العقار */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* عرض الصور */}
          {property.images && property.images.length > 0 ? (
            <>
              <div className="relative w-full h-96 rounded-md overflow-hidden">
                <img
                  src={getImageUrl(property.images[activeImageIndex])}
                  alt={`Property ${activeImageIndex + 1}`}
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((i) =>
                      i === property.images.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
                >
                  &gt;
                </button>
              </div>
              <div className="flex mt-2 space-x-2 overflow-x-auto">
                {property.images.map((img, i) => (
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    alt={`Thumb ${i + 1}`}
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
              <p className="text-gray-500">No images available</p>
            </div>
          )}
          {/* معلومات وواجهة التقييم */}
          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-xl text-gray-600 mb-4">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(property.price)}
              {property.listingType === "rent" ? "/month" : ""}
            </p>

            {/* تقييم النجوم */}
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
              <Badge variant="outline">{property.listingType}</Badge>
            </div>

            {/* تقييمات */}
           

            {/* وصف ومواصفات العقار */}
            <div className="flex gap-4 text-gray-600 mb-4 flex-wrap mt-4">
              <div className="flex items-center gap-1">
                <Bed className="w-5 h-5" />
                {property.features.bedrooms}
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-5 h-5" />
                {property.features.bathrooms}
              </div>
              <div className="flex items-center gap-1">
                <Square className="w-5 h-5" />
                {property.area} m²
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                {property.address?.city || "N/A"}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* قائمة التعليقات */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">التقييمات والتعليقات</h3>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id || r.id}
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

        {/* الجهة اليمنى: بطاقات وأزرار */}
        <div>
          <Card className="p-4">
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleShowSchedule}>
                {showSchedule ? "إخفاء مواعيد الحجز" : "عرض مواعيد الحجز"}
              </Button>
              {showSchedule && (
                <div className="mt-2 p-4 border rounded max-h-64 overflow-auto bg-white">
                  {loadingAppointments && <p>جاري تحميل...</p>}
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
                          {new Date(a.date).toLocaleDateString()} -{a.time}
                        </span>
                        <Button
                          size="sm"
                          variant={
                            selectedAppointmentId === a._id
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                             console.log("🔘 تم اختيار الموعد:", a._id); 
                            setSelectedAppointmentId(a._id)}}
                        >
                          {selectedAppointmentId === a._id
                            ? "محدد ✅"
                            : "اختيار"}
                        </Button>
                      </li>
                    ))}

                    {appointments.length > 0 && (
                      <div className="mt-4 text-right">
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

           <Button className="w-full" variant="outline" onClick={handleContactOwner}>
  <MessageSquare className="mr-2" /> تواصل مع المالك
</Button>


              <Button
                className="w-full"
                variant="ghost"
                onClick={handleSaveProperty}
              >
                <Heart className="mr-2" /> حفظ العقار
              </Button>

             

              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold">معلومات المالك</h3>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {property.ownerId?.fullName || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {property.ownerId?.phoneNumber || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {property.ownerId?.email || "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Tabs إضافية */}
      <Tabs defaultValue="details" className="mt-10">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="nearbysevice">nearby sevices</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <h3 className="text-xl font-semibold mb-2">Property Details</h3>
          <p>{property.description}</p>
        </TabsContent>

        <TabsContent value="features">
          <h3 className="text-xl font-semibold mb-2">Features</h3>
          <ul className="list-disc pl-5">
            {property.features ? (
              <>
                <li>Bedrooms: {property.features.bedrooms}</li>
                <li>Bathrooms: {property.features.bathrooms}</li>
                <li>Parking: {property.features.parking ? "Yes" : "No"}</li>
                <li>Furnished: {property.features.furnished ? "Yes" : "No"}</li>
              </>
            ) : (
              <li>No features listed.</li>
            )}
          </ul>
        </TabsContent>

        <TabsContent value="location">
          <h3 className="text-xl font-semibold mb-2">Location</h3>
          {renderLocationDetails()}
        </TabsContent>

        <TabsContent value="contact">
          <h3 className="text-xl font-semibold mb-2">Contact Owner</h3>
          <p>الاسم: {property.ownerId?.fullName || "N/A"}</p>
          <p>الهاتف: {property.ownerId?.phoneNumber || "N/A"}</p>
          <p>البريد: {property.ownerId?.email || "N/A"}</p>
        </TabsContent>
        <TabsContent value="nearbysevice">
  {renderNearbyServices()}
</TabsContent>
    </Tabs>
    </div>
  );
};

export default PropertyDetail;
