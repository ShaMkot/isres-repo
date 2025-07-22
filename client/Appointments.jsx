import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/badge";
import {
  Calendar,
  Clock,
  User,
  Trash2,
  Phone,
  Mail,
  Home,
  Loader2,
  AlertCircle,
  List,
  CheckCircle,
  XCircle,
  Circle
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/Tabs";
import { useAuth } from "../context/AuthContext";

export default function OwnerAppointments() {
  const { user } = useAuth();
  const token = user?.token;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("فشل في جلب المواعيد");

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const deleteAppointment = async (id) => {
    if (!window.confirm("هل تريد إلغاء هذا الموعد؟")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ أثناء الحذف");
        return;
      }

      setAppointments((prev) => prev.filter((a) => a._id !== id));
      alert("✅ تم إلغاء الموعد بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع");
    }
  };

  function AppointmentCard({ appointment, onDelete }) {
    const customerName = appointment.customerId?.fullName || appointment.clientName || "عميل";
    const customerPhone = appointment.customerId?.phone || appointment.clientPhone;
    const customerEmail = appointment.customerId?.email || appointment.clientEmail;

    return (
      <Card dir="rtl" className="hover:shadow-md transition-shadow duration-200 border border-gray-100">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-indigo-600" />
                {appointment.realEstateId?.title || "عقار غير معروف"}
              </CardTitle>
              <CardDescription className="mt-1">موعد مشاهدة العقار</CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(appointment.status)} text-xs font-medium`}
            >
              {getStatusText(appointment.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-indigo-600" />
                <span className="font-medium">{customerName}</span>
              </div>
               <div className="space-y-3">
              {customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <span>{customerPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-indigo-600" />
                <span>{customerEmail}</span>
              </div>
            </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>{new Date(appointment.date).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>{appointment.time}</span>
              </div>
            </div>

           
          </div>

          {appointment.status !== "Cancelled" && (
            <div className="flex justify-end mt-4">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => onDelete(appointment._id)}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                إلغاء الموعد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function getStatusColor(status) {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "Pending": return "قيد الانتظار";
      case "Confirmed": return "مؤكد";
      case "Completed": return "مكتمل";
      case "Cancelled": return "ملغى";
      default: return status;
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="mt-4 text-gray-600">جاري تحميل المواعيد...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">حدث خطأ</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <Button 
        variant="outline" 
        onClick={fetchAppointments}
        className="text-indigo-600"
      >
        المحاولة مرة أخرى
      </Button>
    </div>
  );

  return (
    <div dir="rtl" className="w-full text-right space-y-6">
      <Tabs defaultValue="all">
        <TabsList className="mb-6 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <List className="h-4 w-4" />
            الكل
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {appointments.length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Circle className="h-4 w-4 text-yellow-500" />
            قيد الانتظار
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {appointments.filter(a => a.status === "Pending").length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="confirmed" 
            className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            مؤكد
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {appointments.filter(a => a.status === "Confirmed").length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="completed" 
            className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <CheckCircle className="h-4 w-4 text-blue-500" />
            مكتمل
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {appointments.filter(a => a.status === "Completed").length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="cancelled" 
            className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <XCircle className="h-4 w-4 text-red-500" />
            ملغى
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {appointments.filter(a => a.status === "Cancelled").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد</h3>
              <p className="text-gray-600">لا توجد مواعيد مضافة حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  appointment={apt}
                  onDelete={deleteAppointment}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {["pending", "confirmed", "completed", "cancelled"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {appointments
                .filter((apt) => apt.status.toLowerCase() === status)
                .map((apt) => (
                  <AppointmentCard
                    key={apt._id}
                    appointment={apt}
                    onDelete={deleteAppointment}
                  />
                ))}
              {appointments.filter((apt) => apt.status.toLowerCase() === status).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد</h3>
                  <p className="text-gray-600">لا توجد مواعيد في هذه الحالة</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}