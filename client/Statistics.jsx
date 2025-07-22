import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await axios.get("/api/statistics/user/statistics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStatistics(res.data);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل البيانات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const viewsData = statistics.map((item) => ({
    name: item.title,
    views: item.favoritesCount,
    bookings: item.bookingsCount,
  }));

  const topProperties = [...statistics]
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5)
    .map((item) => ({
      name: item.title,
      views: item.favoritesCount,
      bookings: item.bookingsCount,
    }));

  const pieData = statistics.map((item, index) => ({
    name: item.title,
    value: item.bookingsCount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold">الإحصائيات</h1>
        <p className="text-muted-foreground">تحليل أداء العقارات وتفاعل الزوار</p>
      </div>

      {loading ? (
        <p>جاري تحميل البيانات...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex justify-end">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="properties">العقارات</TabsTrigger>
            <TabsTrigger value="engagement">التفاعل</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>المشاهدات والحجوزات مع الوقت</CardTitle>
                  <CardDescription>مقارنة تفاعل العقارات</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" name="المشاهدات" />
                      <Line type="monotone" dataKey="bookings" stroke="#82ca9d" name="الحجوزات" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع الحجوزات</CardTitle>
                  <CardDescription>أكثر العقارات حجزًا</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>أفضل العقارات أداءً</CardTitle>
                <CardDescription>بناءً على المشاهدات والحجوزات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProperties} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" name="المشاهدات" />
                    <Bar dataKey="bookings" fill="#82ca9d" name="الحجوزات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>متوسط المشاهدات لكل عقار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(
                      viewsData.reduce((sum, item) => sum + item.views, 0) /
                      viewsData.length
                    ).toFixed(0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    متوسط عدد الإضافات للمفضلة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>نسبة التحويل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(
                      (viewsData.reduce((sum, item) => sum + item.bookings, 0) /
                        viewsData.reduce((sum, item) => sum + item.views, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-sm text-muted-foreground">
                    من المشاهدة إلى الحجز
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>متوسط سرعة الرد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-sm text-muted-foreground">لم يتم تتبعها بعد</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Statistics;
