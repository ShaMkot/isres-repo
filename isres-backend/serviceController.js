const axios = require("axios");
const RealEstate = require("../models/RealEstate"); // لاستيراد العقارات من قاعدة البيانات

// دالة لتحويل العنوان إلى إحداثيات (lat, lon) باستخدام Nominatim API
const geocodeAddress = async (address) => {
  try {
    const addressString = `${address.city}, ${address.street}`;  // دمج الحقول لعمل العنوان

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: addressString,  // العنوان بعد دمجه كـ string
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "RealEstateApp (xy@email.com)",
      },
    });

    console.log("Nominatim API response:", response.data);

    const data = response.data;
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } else {
      throw new Error("لم يتم العثور على الإحداثيات للعقار");
    }
  } catch (error) {
    console.error("حدث خطأ أثناء تحويل العنوان إلى إحداثيات:", error.message);
    throw new Error("حدث خطأ أثناء تحويل العنوان إلى إحداثيات");
  }
};

// دالة للبحث عن الخدمات القريبة بناءً على العنوان المخزن للعقار
const getNearbyServices = async (realEstateId) => {
  try {
    // العثور على العقار بناءً على الـ ID
    const realEstate = await RealEstate.findById(realEstateId);
    if (!realEstate) {
      throw new Error("العقار غير موجود");
    }

    // أخذ العنوان من العقار
    const address = realEstate.address;  // تأكد من أن `address` موجود هنا
console.log(address);
    // تحويل العنوان إلى إحداثيات (lat, lon)
    const { lat, lon } = await geocodeAddress(address);

    // البحث عن الخدمات القريبة باستخدام Overpass API
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
    [out:json];
    (
      node[amenity=school](around:500,${lat},${lon});
      node[amenity=cafe](around:500,${lat},${lon});
      node[amenity=pharmacy](around:500,${lat},${lon});
      node[amenity=hospital](around:500,${lat},${lon});
      node[amenity=restaurant](around:500,${lat},${lon});
      node[amenity=doctors](around:500,${lat},${lon});
      node[shop=supermarket](around:500,${lat},${lon});
      node[shop=mall](around:500,${lat},${lon});
      node[leisure=park](around:500,${lat},${lon});
      node[leisure=sports_centre](around:500,${lat},${lon});
    );
    out center;
    `;
    
    const response = await axios.post(overpassUrl, `data=${query}`);
    const services = response.data.elements.map(element => ({
      name: element.tags.name || 'Unnamed',
      lat: element.lat || element.center.lat,
      lon: element.lon || element.center.lon,
      distance: haversine(lat, lon, element.lat || element.center.lat, element.lon || element.center.lon),
    }));

    return services;  // إرجاع الخدمات مع المسافة
  } catch (error) {
    console.error("خطأ أثناء البحث عن الخدمات:", error.message);
    throw new Error(`حدث خطأ أثناء البحث عن الخدمات: ${error.message}`);
  }
};

// دالة لحساب المسافة بين نقطتين باستخدام خوارزمية هافرسين
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;  // radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;  // distance in kilometers
}

module.exports = {
  getNearbyServices,
};
