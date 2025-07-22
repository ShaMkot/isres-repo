import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/ui/card'; // ✅ عدّل المسار حسب مشروعك

export default function StatisticsNGO() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboardNGO/statistics-ngo', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const statss = [
          {
            title: 'إجمالي طلبات الدعم',
            value: data.totalRequests,
            change: '+12%',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'الطلبات المقبولة',
            value: data.acceptedRequests,
            change: '+8%',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            title: 'الطلبات قيد الانتظار',
            value: data.pendingRequests,
            change: '-5%',
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
            title: 'الطلبات المرفوضة',
            value: data.rejectedRequests,
            change: '+2%',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          },
          {
            title: 'الدردشات النشطة',
            value: data.activeChats,
            change: '+15%',
            icon: MessageSquare,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            title: 'الإشعارات المرسلة',
            value: data.totalNotifications,
            change: '+23%',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          }
        ];

        setStats(statss);
        setRecentActivity(data.recentActivity || []);
      })
      .catch((error) => console.error('حدث خطأ أثناء جلب الإحصائيات:', error));
  }, []);

  return (
    <div dir="rtl" className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p
                      className={`text-sm mt-1 ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change} مقارنة بالشهر الماضي
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* النشاطات الحديثة والعمليات السريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">النشاطات الحديثة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <p className="text-gray-500 text-sm text-right">لا توجد نشاطات حديثة.</p>
              )}
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'accepted'
                        ? 'bg-green-500'
                        : activity.type === 'rejected'
                        ? 'bg-red-500'
                        : activity.type === 'complaint'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  ></div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">بواسطة {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.time).toLocaleString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">العمليات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">مراجعة الطلبات</p>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">الدردشات النشطة</p>
              </button>
              <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-yellow-800">شكاوى جديدة</p>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-800">توليد تقرير</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
