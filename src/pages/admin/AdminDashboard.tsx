import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart2,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Tổng số đề tài",
      value: "257",
      icon: FileText,
      change: "+12% so với kỳ trước",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Đề tài đang thực hiện",
      value: "85",
      icon: Clock,
      change: "+5% so với kỳ trước",
      color: "bg-amber-100 text-amber-800",
    },
    {
      title: "Đề tài hoàn thành",
      value: "172",
      icon: CheckCircle,
      change: "+8% so với kỳ trước",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Tổng số chủ nhiệm",
      value: "143",
      icon: Users,
      change: "+3% so với kỳ trước",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Bảng điều khiển quản trị
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Cập nhật lần cuối: 09:45 AM hôm nay
          </span>
          <Button size="sm">
            <RotateCw />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${activity.color} mt-0.5`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
              Xem tất cả hoạt động
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông báo mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement, i) => (
              <div key={i} className="space-y-2 border-b pb-4 last:border-0">
                <div className="flex justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${announcement.color}`}
                  >
                    {announcement.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {announcement.date}
                  </span>
                </div>
                <p className="text-sm font-medium">{announcement.title}</p>
                <p className="text-xs text-muted-foreground">
                  {announcement.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 p-0 h-auto text-primary"
                >
                  Chi tiết
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
              Quản lý thông báo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const recentActivities = [
  {
    icon: FileText,
    title: "Đăng ký đề tài mới",
    description:
      'TS. Nguyễn Văn A đã đăng ký đề tài mới "Nghiên cứu ứng dụng AI trong giảng dạy"',
    time: "30 phút trước",
    color: "bg-blue-100 text-blue-800",
  },
  {
    icon: CheckCircle,
    title: "Hoàn thành đề tài",
    description: "Đề tài DT2023-031 đã được hoàn thành và nghiệm thu",
    time: "2 giờ trước",
    color: "bg-green-100 text-green-800",
  },
  {
    icon: Users,
    title: "Thêm thành viên mới",
    description: "TS. Trần Thị B đã được thêm vào đề tài DT2023-042",
    time: "3 giờ trước",
    color: "bg-purple-100 text-purple-800",
  },
  {
    icon: BarChart2,
    title: "Cập nhật báo cáo tiến độ",
    description:
      "TS. Lê Văn C đã cập nhật báo cáo tiến độ cho đề tài DT2023-038",
    time: "5 giờ trước",
    color: "bg-amber-100 text-amber-800",
  },
];

const announcements = [
  {
    type: "Đợt đăng ký mới",
    title: "Thông báo đăng ký đề tài NCKH cấp Trường năm 2023-2024",
    description:
      "Trường thông báo về việc đăng ký đề tài nghiên cứu khoa học cấp Trường năm học 2023-2024.",
    date: "01/09/2023",
    color: "bg-blue-100 text-blue-800",
  },
  {
    type: "Hướng dẫn",
    title: "Hướng dẫn quy trình đăng ký đề tài theo chuẩn ISO mới",
    description:
      "Phòng QLKH&CN hướng dẫn quy trình đăng ký đề tài theo chuẩn ISO mới được áp dụng từ năm học 2023-2024.",
    date: "28/08/2023",
    color: "bg-green-100 text-green-800",
  },
  {
    type: "Tài chính",
    title: "Thông báo kinh phí hỗ trợ đề tài NCKH năm học 2023-2024",
    description:
      "Thông báo mức kinh phí hỗ trợ cho các đề tài nghiên cứu khoa học cấp Trường năm học 2023-2024.",
    date: "25/08/2023",
    color: "bg-amber-100 text-amber-800",
  },
];

export default AdminDashboard;
