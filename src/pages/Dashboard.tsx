
import React from 'react';
import { ArrowRight, Calendar, ClipboardList, FileCheck, FilePlus, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statCards = [
  {
    title: 'Đề tài đang thực hiện',
    value: '24',
    icon: ClipboardList,
    change: '+4 so với kỳ trước',
    trend: 'up',
  },
  {
    title: 'Đề tài chờ phê duyệt',
    value: '12',
    icon: FileCheck,
    change: '-2 so với kỳ trước',
    trend: 'down',
  },
  {
    title: 'Đợt đăng ký mới',
    value: '1',
    icon: Calendar,
    change: 'Mở đến 30/09/2023',
    trend: 'neutral',
  },
  {
    title: 'Giảng viên tham gia',
    value: '56',
    icon: Users,
    change: '+8 so với kỳ trước',
    trend: 'up',
  },
];

const recentTopics = [
  {
    id: 'DT2023-042',
    title: 'Nghiên cứu ứng dụng trí tuệ nhân tạo trong dự đoán sự cố hệ thống điện',
    status: 'Đang thực hiện',
    date: '15/08/2023',
    leader: 'TS. Nguyễn Văn A',
  },
  {
    id: 'DT2023-038',
    title: 'Phát triển phương pháp giảng dạy tích hợp cho sinh viên kỹ thuật',
    status: 'Chờ nghiệm thu',
    date: '02/07/2023',
    leader: 'PGS.TS. Trần Thị B',
  },
  {
    id: 'DT2023-036',
    title: 'Thiết kế hệ thống IoT thu thập dữ liệu môi trường trong khuôn viên trường',
    status: 'Đã nghiệm thu',
    date: '28/06/2023',
    leader: 'TS. Lê Văn C',
  },
];

const announcements = [
  {
    title: 'Thông báo về đợt đăng ký đề tài NCKH cấp Trường năm 2023',
    date: '01/09/2023',
    type: 'Thông báo chung',
  },
  {
    title: 'Hướng dẫn quy trình nghiệm thu đề tài NCKH theo ISO mới',
    date: '25/08/2023',
    type: 'Hướng dẫn',
  },
  {
    title: 'Lịch bảo vệ đề tài NCKH đợt tháng 9/2023',
    date: '20/08/2023',
    type: 'Lịch',
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Quản lý nghiên cứu khoa học</h1>
          <p className="text-muted-foreground mt-1">Chào mừng đến với hệ thống quản lý nghiên cứu khoa học UTE-SciHub</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700 transition-all">
          <FilePlus className="mr-2 h-4 w-4" />
          Đăng ký đề tài mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="animate-scale-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs mt-1 ${
                card.trend === 'up' ? 'text-green-600' : 
                card.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>Đề tài gần đây</CardTitle>
              <CardDescription>
                Các đề tài được cập nhật gần đây
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTopics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{topic.id}</span>
                      <Badge variant={
                        topic.status === 'Đang thực hiện' ? 'default' :
                        topic.status === 'Chờ nghiệm thu' ? 'secondary' : 
                        'outline'
                      }>
                        {topic.status}
                      </Badge>
                    </div>
                    <p className="text-base font-semibold leading-tight">{topic.title}</p>
                    <div className="flex text-sm text-muted-foreground gap-2">
                      <span>{topic.leader}</span>
                      <span>•</span>
                      <span>{topic.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary-500 transition-colors" />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary-500 gap-1">
                Xem tất cả đề tài
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>Thông báo mới</CardTitle>
            <CardDescription>
              Cập nhật thông tin về hoạt động nghiên cứu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement, i) => (
                <div key={i} className="flex flex-col space-y-1 group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {announcement.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{announcement.date}</span>
                  </div>
                  <p className="text-sm font-medium group-hover:text-primary-600 transition-colors">
                    {announcement.title}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary-500 gap-1">
                Xem tất cả thông báo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
