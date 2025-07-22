import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NGOsCard from "../components/NGOsCard";
import { useToast } from "../hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const fetchNgos = async () => {
  const res = await axios.get("http://localhost:5000/api/ngos");
  return res.data;
};

const NGOs = () => {
  const location = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const {
    data: ngos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ngos"],
    queryFn: fetchNgos,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: () =>
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل الجمعيات. يرجى المحاولة لاحقًا.",
        variant: "destructive",
      }),
  });

  useEffect(() => {
    if (location.state?.newNgo) {
      const exists = ngos.some((ngo) => ngo._id === location.state.newNgo._id);
      if (!exists) {
        ngos.unshift(location.state.newNgo);
        toast({
          title: "تم إضافة جمعية جديدة",
          description: `${location.state.newNgo.name} تمت إضافتها.`,
        });
      }
    }
  }, [location.state, ngos, toast]);

  const allServices = ngos.flatMap((ngo) => ngo.services || []);
  const uniqueServices = Array.from(new Set(allServices));

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      searchQuery === "" ||
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      selectedService === null || ngo.services.includes(selectedService);

    return matchesSearch && matchesService;
  });

  return (
    <div dir="rtl" className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">الجمعيات الخيرية</h1>
        <p className="text-gray-600">استكشف الجمعيات الخيرية المتاحة لدينا</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن جمعية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <select
          value={selectedService || ""}
          onChange={(e) => setSelectedService(e.target.value || null)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">جميع الخدمات</option>
          {uniqueServices.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>حدث خطأ أثناء تحميل الجمعيات: {error.message}</p>
        </div>
      ) : filteredNGOs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد جمعيات متطابقة مع معايير البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNGOs.map((ngo) => (
            <NGOsCard key={ngo._id} ngo={ngo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NGOs;