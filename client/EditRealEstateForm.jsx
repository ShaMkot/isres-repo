import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapPicker from "./MapPicker"; // <-- استيراد مكون MapPicker (عدل المسار حسب مكانه عندك)

// إصلاح مشكلة الأيقونات الافتراضية في Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
};

const EditRealEstateForm = ({ property, token, onClose, onUpdateSuccess }) => {
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
      latitude: 24.7136,
      longitude: 46.6753,
    },
  });

  useEffect(() => {
    if (property) {
      setFormData((prev) => ({
        ...prev,
        ...property,
        address: property.address || prev.address,
        features: property.features || prev.features,
        location: property.location || prev.location,
      }));
    }
  }, [property]);

  // هذه الدالة لتحديث الموقع من MapPicker
  const handleLocationChange = (loc) => {
    setFormData((prev) => ({
      ...prev,
      location: loc,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.startsWith("features.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        features: { ...prev.features, [key]: type === "checkbox" ? checked : value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.latitude || !formData.location.longitude) {
      alert("يرجى تحديد الموقع على الخريطة");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/realestate/${property._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("تم تحديث العقار بنجاح");
      onUpdateSuccess(response.data);
      onClose();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تحديث العقار");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-full overflow-auto rounded shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">تعديل العقار</h2>

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
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="features.parking"
                checked={formData.features.parking}
                onChange={handleChange}
              />
              <span>مواقف</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="features.furnished"
                checked={formData.features.furnished}
                onChange={handleChange}
              />
              <span>مفروش</span>
            </label>
          </div>

          {/* 🗺️ خريطة تحديد الموقع (مكون MapPicker) */}
          <div className="mt-4">
            <label className="block font-medium mb-2">حدد الموقع على الخريطة:</label>
            <MapPicker
              onLocationSelect={handleLocationChange}
              initialLocation={{
                latitude: formData.location.latitude,
                longitude: formData.location.longitude,
              }}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRealEstateForm;
