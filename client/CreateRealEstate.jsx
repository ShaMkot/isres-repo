import { useState } from "react";
import axios from "axios";
import MapPicker from "../components/MapPicker";
import { useAuth } from "../context/AuthContext";

export default function CreateRealEstate() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    propertyType: "Apartment",
    listingType: "Sale",
    address: {
      city: "",
      state: "",
      street: "",
      zipCode: "",
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      furnished: false,
    },
    location: {
      latitude: null,
      longitude: null,
    },
    images: [],
    appointments: [],
  });

  const [appointment, setAppointment] = useState({ date: "", time: "" });
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData({ ...formData, address: { ...formData.address, [key]: value } });
    } else if (name.startsWith("features.")) {
      const key = name.split(".")[1];
      const val = type === "checkbox" ? checked : value;
      setFormData({ ...formData, features: { ...formData.features, [key]: val } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  // تعديل هنا لمنع مواعيد بتاريخ سابق
  const handleAddAppointment = () => {
    if (!appointment.date || !appointment.time) return;

    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDate = new Date(appointment.date);

    if (selectedDate < todayDateOnly) {
      alert("لا يمكنك إضافة موعد بتاريخ سابق لتاريخ اليوم");
      return;
    }

    setFormData({
      ...formData,
      appointments: [...formData.appointments, appointment],
    });
    setAppointment({ date: "", time: "" });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: {
          format: "json",
          lat: lat,
          lon: lng,
          addressdetails: 1,
        },
      });
      return response.data.address;
    } catch (error) {
      console.error("خطأ في جلب العنوان من الإحداثيات:", error);
      return null;
    }
  };

  const handleLocationSelect = async (loc) => {
    setFormData((prev) => ({
      ...prev,
      location: loc,
    }));

    const address = await reverseGeocode(loc.latitude, loc.longitude);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        address: {
          city: address.city || address.town || address.village || "",
          state: address.state || "",
          street: address.road || "",
          zipCode: address.postcode || "",
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location.latitude || !formData.location.longitude) {
      alert("يرجى تحديد الموقع على الخريطة");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("area", formData.area);
      data.append("propertyType", formData.propertyType);
      data.append("listingType", formData.listingType);
      data.append("address", JSON.stringify(formData.address));
      data.append("features", JSON.stringify(formData.features));
      data.append("location", JSON.stringify(formData.location));
      data.append("appointments", JSON.stringify(formData.appointments));
      formData.images.forEach((image) => {
        data.append("images", image);
      });

      await axios.post("http://localhost:5000/api/realestate", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("تمت إضافة العقار بنجاح");
      setFormData({
        title: "",
        description: "",
        price: "",
        area: "",
        propertyType: "Apartment",
        listingType: "Sale",
        address: {
          city: "",
          state: "",
          street: "",
          zipCode: "",
        },
        features: {
          bedrooms: 1,
          bathrooms: 1,
          parking: false,
          furnished: false,
        },
        location: {
          latitude: null,
          longitude: null,
        },
        images: [],
        appointments: [],
      });
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة العقار");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">إضافة عقار</h2>

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="العنوان"
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="الوصف"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="السعر"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="area"
        value={formData.area}
        onChange={handleChange}
        placeholder="المساحة (م²)"
        className="w-full p-2 border rounded"
      />

      <select
        name="propertyType"
        value={formData.propertyType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Apartment">شقة</option>
        <option value="Villa">فيلا</option>
        <option value="Land">أرض</option>
      </select>

      <select
        name="listingType"
        value={formData.listingType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Sale">بيع</option>
        <option value="Rent">إيجار</option>
      </select>

      <div className="grid grid-cols-2 gap-2">
        <input
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
          placeholder="المدينة"
          className="p-2 border rounded"
        />
        <input
          name="address.state"
          value={formData.address.state}
          onChange={handleChange}
          placeholder="المنطقة"
          className="p-2 border rounded"
        />
        <input
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          placeholder="الشارع"
          className="p-2 border rounded"
        />
        <input
          name="address.zipCode"
          value={formData.address.zipCode}
          onChange={handleChange}
          placeholder="الرمز البريدي"
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          name="features.bedrooms"
          value={formData.features.bedrooms}
          onChange={handleChange}
          placeholder="عدد غرف النوم"
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="features.bathrooms"
          value={formData.features.bathrooms}
          onChange={handleChange}
          placeholder="عدد الحمامات"
          className="p-2 border rounded"
        />
        <label>
          <input
            type="checkbox"
            name="features.parking"
            checked={formData.features.parking}
            onChange={handleChange}
          />{" "}
          مواقف
        </label>
        <label>
          <input
            type="checkbox"
            name="features.furnished"
            checked={formData.features.furnished}
            onChange={handleChange}
          />{" "}
          مفروش
        </label>
      </div>

      <div className="border p-3 rounded bg-gray-50">
        <h3 className="font-semibold mb-2">مواعيد المعاينة</h3>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="date"
            value={appointment.date}
            onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
            className="border rounded p-2"
          />
          <input
            type="time"
            value={appointment.time}
            onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
            className="border rounded p-2"
          />
          <button
            type="button"
            onClick={handleAddAppointment}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            إضافة الموعد
          </button>
        </div>

        {formData.appointments.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {formData.appointments.map((appt, idx) => (
              <li key={idx}>
                التاريخ: {appt.date} | الوقت: {appt.time}
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="block">
        صورة العقار:
        <input type="file" onChange={handleFileChange} multiple className="mt-1" />
      </label>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">اختر الموقع من الخريطة</h3>
        <MapPicker onLocationSelect={handleLocationSelect} />
        {formData.location.latitude && (
          <p className="mt-2 text-sm">
            الموقع المحدد: {formData.location.latitude}, {formData.location.longitude}
          </p>
        )}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        إضافة العقار
      </button>
    </form>
  );
}
