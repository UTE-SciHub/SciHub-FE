
import React from 'react';
import { FileTextIcon, PlusCircle, Search, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const registrationPeriods = [
  {
    id: '2023-2',
    title: 'Đợt đăng ký đề tài NCKH 2023 - Đợt 2',
    status: 'Đang mở',
    startDate: '01/09/2023',
    endDate: '30/09/2023',
    description: 'Đợt đăng ký dành cho giảng viên và nghiên cứu sinh.',
    remainingDays: 15,
  },
  {
    id: '2023-1',
    title: 'Đợt đăng ký đề tài NCKH 2023 - Đợt 1',
    status: 'Đã đóng',
    startDate: '01/03/2023',
    endDate: '30/03/2023',
    description: 'Đợt đăng ký dành cho giảng viên và nghiên cứu sinh.',
    remainingDays: 0,
  },
];

const myTopics = [
  {
    id: 'DT2023-027',
    title: 'Xây dựng hệ thống cảnh báo sớm cho hệ thống thủy lợi dựa trên IoT',
    status: 'Chờ xét duyệt',
    submittedDate: '10/09/2023',
    field: 'Công nghệ thông tin',
  },
  {
    id: 'DT2023-016',
    title: 'Nghiên cứu ứng dụng vật liệu composite trong chế tạo chi tiết máy',
    status: 'Đã phê duyệt',
    submittedDate: '15/03/2023',
    field: 'Cơ khí',
  },
];

const TopicRegistration = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Đăng ký đề tài</h1>
          <p className="text-muted-foreground">Quản lý đợt đăng ký và đề xuất đề tài nghiên cứu khoa học</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Tìm kiếm đề tài..."
            className="md:w-64 w-full"
          />
          <Button className="bg-primary-600 hover:bg-primary-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Đăng ký mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="registration-periods" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="registration-periods">Đợt đăng ký</TabsTrigger>
          <TabsTrigger value="my-topics">Đề tài của tôi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registration-periods" className="animate-fade-in space-y-4 mt-4">
          {registrationPeriods.map((period, i) => (
            <Card key={i} className={`animate-scale-in overflow-hidden ${i === 0 ? 'border-primary-100' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <CardTitle className="text-lg">{period.title}</CardTitle>
                    <Badge variant={period.status === 'Đang mở' ? 'default' : 'secondary'}>
                      {period.status}
                    </Badge>
                  </div>
                  {period.status === 'Đang mở' && (
                    <Badge variant="outline" className="bg-primary-50">
                      Còn {period.remainingDays} ngày
                    </Badge>
                  )}
                </div>
                <CardDescription className="pt-1">
                  {period.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Thời gian:</span>
                    <span className="text-sm text-muted-foreground">
                      {period.startDate} - {period.endDate}
                    </span>
                  </div>
                  
                  {period.status === 'Đang mở' ? (
                    <Button className="w-full md:w-auto">
                      <FileTextIcon className="mr-2 h-4 w-4" />
                      Đăng ký đề tài
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full md:w-auto">
                      Đã kết thúc
                    </Button>
                  )}
                </div>
              </CardContent>
              {period.status === 'Đang mở' && (
                <div className="h-1.5 bg-primary-100 w-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600" 
                    style={{ width: `${(1 - period.remainingDays/30) * 100}%` }} 
                  />
                </div>
              )}
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="my-topics" className="animate-fade-in space-y-4 mt-4">
          {myTopics.map((topic, i) => (
            <Card key={i} className="animate-scale-in hover:shadow-md transition-all" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{topic.id}</span>
                    <Badge variant={topic.status === 'Đã phê duyệt' ? 'outline' : 'secondary'}>
                      {topic.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{topic.submittedDate}</span>
                </div>
                <CardTitle className="text-base">{topic.title}</CardTitle>
                <CardDescription>
                  Lĩnh vực: {topic.field}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                  {topic.status === 'Chờ xét duyệt' && (
                    <Button variant="secondary" size="sm">
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {myTopics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileTextIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Chưa có đề tài nào</h3>
              <p className="text-muted-foreground mb-4">Bạn chưa đăng ký đề tài nào trong hệ thống</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Đăng ký đề tài mới
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TopicRegistration;
