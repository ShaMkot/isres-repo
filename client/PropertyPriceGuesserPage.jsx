import React, { useState } from "react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import {
  Calculator,
  MapPin,
  Home,
  Ruler,
} from "lucide-react";

const PropertyPriceGuesserPage = () => {
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm({
    defaultValues: {
      propertyType: "",
      area: 50,
      location: "",
    },
  });

  const calculatePrice = async (data) => {
    setIsCalculating(true);
    setEstimatedPrice(null);

    try {
      const response = await fetch("http://localhost:3002/predict-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area: data.area,
          property_type: data.propertyType,
          address: data.location,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setEstimatedPrice(result.prediction_result);
      } else {
        setEstimatedPrice(
          "❌ فشل التنبؤ: " + (result.message || result.error)
        );
      }
    } catch (err) {
      setEstimatedPrice("❌ خطأ في الخادم: " + err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = (data) => {
    calculatePrice(data);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SY", {
      style: "currency",
      currency: "SYP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Calculator className="h-12 w-12 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">حاسبة سعر العقار</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          احصل على تقدير فوري لقيمة عقارك من خلال إدخال بعض المعلومات الأساسية.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>مواصفات العقار</CardTitle>
            <CardDescription>
              أدخل التفاصيل للحصول على التقدير
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Home className="h-4 w-4 ml-2" /> نوع العقار
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="شقة">شقة</SelectItem>
                          <SelectItem value="بيت عربي">بيت عربي</SelectItem>
                          <SelectItem value="بيت">بيت</SelectItem>
                          <SelectItem value="استوديو">استوديو</SelectItem>
                          <SelectItem value="سويت">سويت</SelectItem>
                          <SelectItem value="مقهى">مقهى</SelectItem>
                          <SelectItem value="مكتب">مكتب</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Ruler className="h-4 w-4 ml-2" /> المساحة (م²)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2" /> الموقع (اسم المنطقة)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثلاً: المالكي، باب توما، كفرسوسة..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCalculating}
                >
                  {isCalculating ? "جاري الحساب..." : "احسب السعر"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تقدير السعر</CardTitle>
            <CardDescription>بناءً على التفاصيل المدخلة</CardDescription>
          </CardHeader>
          <CardContent>
            {isCalculating ? (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <Calculator className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">جاري حساب السعر...</p>
                </div>
              </div>
            ) : estimatedPrice ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    القيمة التقديرية
                  </h3>
                  <div className="text-2xl font-bold text-blue-500 mb-2">
                    {typeof estimatedPrice === "number"
                      ? formatCurrency(estimatedPrice)
                      : estimatedPrice}
                  </div>
                  {typeof estimatedPrice === "number" && (
                    <p className="text-gray-600">
                      ±{formatCurrency(estimatedPrice * 0.1)} هامش التقدير
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">أدخل بيانات العقار لحساب السعر</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyPriceGuesserPage;
