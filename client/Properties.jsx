import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertySearch from '../components/PropertySearch';
import PropertyCard from '../components/PropertyCard';
import { useToast } from '../components/use-toast';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

const fetchProperties = async (token) => {
  const response = await fetch('http://localhost:5000/api/realestate', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('فشل في تحميل العقارات');
  const data = await response.json();

  return data.map((item) => ({
    _id: item._id || Math.random().toString(36).substring(2, 9),
    title: item.title || 'عقار بدون عنوان',
    price: item.price || 0,
    status: item.status || 'غير معروف',
    images: Array.isArray(item.images) ? item.images : [],
    location: item.location || {},
    address: item.address || {},
    features: item.features || {},
    owner: item.owner || {},
    propertyType: item.propertyType || 'غير معروف',
    listingType: item.listingType || 'غير معروف',
    ...item,
  }));
};

const Properties = () => {
  const { user } = useAuth();
  const token = user?.token;
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreCount = 6;

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  const {
    data: properties = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['properties', token],
    queryFn: () => fetchProperties(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل العقارات',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyType = queryParams.get('type');
    const query = queryParams.get('q');
    const listingType = queryParams.get('listingType');

    const filtered = properties.filter((property) => {
      if (!property || typeof property !== 'object') return false;

      const matchesType = !propertyType ||
        (property.propertyType && property.propertyType.toLowerCase() === propertyType.toLowerCase());

      const matchesListingType = !listingType ||
        (property.listingType && property.listingType.toLowerCase() === listingType.toLowerCase());

      const matchesQuery = !query || (
        (property.title && property.title.toLowerCase().includes(query.toLowerCase())) ||
        (property.description && property.description.toLowerCase().includes(query.toLowerCase())) ||
        (typeof property.address === 'string' && property.address.toLowerCase().includes(query.toLowerCase()))
      );
      return matchesType && matchesQuery && matchesListingType;
    });

    setFilteredProperties(filtered);
    setVisibleCount(6);
  }, [properties, location.search]);

  useEffect(() => {
    if (inView && visibleCount < filteredProperties.length) {
      setVisibleCount((prev) => prev + loadMoreCount);
    }
  }, [inView, filteredProperties]);

  const handleSearch = (filters) => {
    const filtered = properties.filter((property) => {
      if (!property || typeof property !== 'object') return false;

      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        const matchesSearch =
          (property.title && property.title.toLowerCase().includes(searchQuery)) ||
          (property.description && property.description.toLowerCase().includes(searchQuery)) ||
          (typeof property.address === 'string' && property.address.toLowerCase().includes(searchQuery));
        if (!matchesSearch) return false;
      }

      if (filters.propertyType && property.propertyType !== filters.propertyType) {
        return false;
      }

      if (filters.listingType && property.listingType !== filters.listingType) {
        return false;
      }

      if (filters.priceRange?.length === 2) {
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
          return false;
        }
      }

      if (filters.bedrooms !== 'any') {
        const bd = property.features?.bedrooms ?? property.bedrooms ?? 0;
        if (bd < parseInt(filters.bedrooms)) return false;
      }

      if (filters.bathrooms !== 'any') {
        const bt = property.features?.bathrooms ?? property.bathrooms ?? 0;
        if (bt < parseInt(filters.bathrooms)) return false;
      }

      if (typeof filters.area === 'number' && !isNaN(filters.area)) {
        const areaValue = typeof property.area === 'string' ? parseFloat(property.area) : Number(property.area);
        if (isNaN(areaValue) || areaValue < filters.area) return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
    setVisibleCount(6);
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-right">العقارات</h1>

      <PropertySearch onSearch={handleSearch} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-real-estate-primary mx-auto mb-4"></div>
          <p>جاري تحميل العقارات...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2 text-real-estate-error">حدث خطأ أثناء تحميل العقارات</h3>
          <p className="text-muted-foreground">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-real-estate-primary text-white rounded hover:bg-real-estate-primary-dark transition"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">لا توجد عقارات مطابقة</h3>
          <p className="text-muted-foreground">
            جرّب تغيير معايير البحث للحصول على نتائج.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
            {filteredProperties.slice(0, visibleCount).map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>

          {visibleCount < filteredProperties.length && (
            <div ref={loadMoreRef} className="text-center py-6 text-muted-foreground">
              جاري تحميل المزيد...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Properties;
