import React, { useEffect, useState } from 'react';
import { FileTextIcon, PlusCircle, Search, Calendar, Bell, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { RegistrationPeriod } from '@/models/registraion-period';
import { RegistrationPeriodStatus } from '@/models/enums/registration-period-status';
import { RegistrationService } from '@/service/registration-service';
import { toast } from '@/hooks/use-toast';
import { formatTimeAgo } from '@/utils/dateTimeFormat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await RegistrationService.getAll({
        p: 1,
        s: 10000,
        sort: "createdAt",
        order: "desc",
        year: selectedYear ? parseInt(selectedYear) : undefined,
      });

      setRegistrationPeriods(response.data.data);
    } catch (error) {
      console.error("Error fetching registration periods:", error);
      toast({
        title: "Có lỗi trong quá trình lấy dữ liệu!",
        description: "Không thể tải dữ liệu đợt đăng ký. Vui lòng thử lại sau.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, searchQuery]);

  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Đăng ký đề tài</h1>
          <p className="text-muted-foreground">Quản lý đợt đăng ký và đề xuất đề tài nghiên cứu khoa học</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* <Input
            placeholder="Tìm kiếm đề tài..."
            className="md:w-64 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          /> */}
          <Select onValueChange={(value) => setSelectedYear(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-primary-600 hover:bg-primary-700 transition-all"
            onClick={() => navigate('/topic-proposal')}
          >
            <FilePlus className="h-4 w-4" />
            Đăng ký đề tài
          </Button>
        </div>
      </div>

      <Tabs defaultValue="registration-periods" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="my-topics">Đề tài của tôi</TabsTrigger>
        </TabsList>

        <TabsContent value="registration-periods" className="animate-fade-in space-y-4 mt-4">
          {registrationPeriods.length === 0 ? (
            <Card className="text-center py-8">
              <CardHeader>
                <CardTitle className="text-lg">Không có đợt đăng ký nào</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            registrationPeriods.map((period, i) => (
              <Card
                key={i}
                className={`animate-scale-in overflow-hidden ${i === 0 ? 'border-primary-100' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary-600" />
                      <CardTitle className="text-lg">{period.title}</CardTitle>
                      <Badge variant={period.status === RegistrationPeriodStatus.OPEN ? 'default' : 'secondary'}>
                        {period.status}
                      </Badge>
                    </div>
                    {period.status === RegistrationPeriodStatus.OPEN && (
                      <Badge variant="outline" className="bg-primary-50">
                        Còn {formatTimeAgo(period.endDate)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Thời gian:</span>
                      <span className="text-sm text-muted-foreground">
                        {period.startDate} - {period.endDate}
                      </span>
                    </div>

                    {period.status === RegistrationPeriodStatus.OPEN ? (
                      <Button className="w-full md:w-auto">
                        <FileTextIcon className="h-4 w-4" />
                        Nộp đề tài
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full md:w-auto">
                        Đã kết thúc
                      </Button>
                    )}
                  </div>
                </CardContent>
                {period.status === RegistrationPeriodStatus.OPEN && (
                  <div className="h-1.5 bg-primary-100 w-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((new Date().getTime() - new Date(period.startDate).getTime()) /
                              (new Date(period.endDate).getTime() - new Date(period.startDate).getTime())) *
                            100
                          )
                        ).toFixed(2)}%`,
                      }}
                    />

                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>


        <TabsContent value="my-topics" className="animate-fade-in space-y-4 mt-4">
          {myTopics.map((topic, i) => (
            <Card
              key={i}
              className="animate-scale-in hover:shadow-md transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
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