import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertySearch from '../components/PropertySearch';
import PropertyCard from '../components/PropertyCardOwner';
import { useToast } from '../components/use-toast';
import { useAuth } from '../context/AuthContext';

const Propertiesowner = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) {
        setIsLoading(false);
        setError("يرجى تسجيل الدخول أولاً");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/realestate/my-properties', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('فشل في جلب العقارات');
        const data = await response.json();

        const processedData = data.map(item => ({
          _id: item._id || Math.random().toString(36).substring(2, 9),
          title: item.title || 'بدون عنوان',
          price: item.price || 0,
          status: item.status || 'غير معروف',
          images: Array.isArray(item.images) ? item.images : [],
          location: item.location || {},
          address: item.address || {},
          features: item.features || {},
          owner: item.owner || {},
          propertyType: item.propertyType || 'غير معروف',
          listingType: item.listingType || 'غير معروف',
          ...item
        }));

        setProperties(processedData);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب العقارات:', error);
        setError(error.message);
        toast({
          title: 'خطأ',
          description: 'تعذر تحميل العقارات',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [token]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyType = queryParams.get('type');
    const query = queryParams.get('q');

    let filtered = properties.filter(property => {
      if (!property || typeof property !== 'object') return false;

      const matchesType = !propertyType ||
        (property.propertyType && property.propertyType.toLowerCase() === propertyType.toLowerCase());

      const matchesQuery = !query || (
        (property.title && property.title.toLowerCase().includes(query.toLowerCase())) ||
        (property.description && property.description.toLowerCase().includes(query.toLowerCase())) ||
        (property.address?.city && property.address.city.toLowerCase().includes(query.toLowerCase())) ||
        (property.address?.state && property.address.state.toLowerCase().includes(query.toLowerCase()))
      );

      return matchesType && matchesQuery;
    });

    setFilteredProperties(filtered);
  }, [properties, location.search]);

  const handleAddProperty = () => {
    navigate("/createRealEstate");
  };

  const handleSearch = (filters) => {
    let filtered = properties.filter(property => {
      if (!property || typeof property !== 'object') return false;

      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        const matchesSearch = (
          (property.title && property.title.toLowerCase().includes(searchQuery)) ||
          (property.description && property.description.toLowerCase().includes(searchQuery)) ||
          (property.address?.city && property.address.city.toLowerCase().includes(searchQuery)) ||
          (property.address?.state && property.address.state.toLowerCase().includes(searchQuery))
        );
        if (!matchesSearch) return false;
      }

      if (filters.propertyType && property.propertyType !== filters.propertyType) {
        return false;
      }

      if (filters.listingType && property.listingType !== filters.listingType) {
        return false;
      }

      if (filters.priceRange && filters.priceRange.length === 2) {
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
          return false;
        }
      }

      if (filters.bedrooms && (!property.features?.bedrooms || property.features.bedrooms < parseInt(filters.bedrooms))) {
        return false;
      }

      if (filters.bathrooms && (!property.features?.bathrooms || property.features.bathrooms < parseInt(filters.bathrooms))) {
        return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-right" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">عقاراتي</h1>

    <div className="flex justify-end mb-4">
  <button onClick={handleAddProperty}
    className="bg-blue-600 flex items-center gap-4 text-white px-4 py-2 rounded hover:bg-blue-700">
    إضافة عقار
  </button>
</div>


      <PropertySearch onSearch={handleSearch} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل العقارات...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2 text-red-600">حدث خطأ أثناء تحميل العقارات</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">لم يتم العثور على أي عقار</h3>
          <p className="text-gray-500">
            جرّب تعديل معايير البحث.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Propertiesowner;
