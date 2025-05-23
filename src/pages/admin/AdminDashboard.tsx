import { ArrowRight, FilePlus, ChevronRight, FileText, Users, Calendar, DollarSign, BarChart2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { RegistrationPeriodStatus } from '@/models/enums/registration-period-status';
import { formatDate, formatDateString, formatDateTime } from '@/utils/dateTimeFormat';
import { useEffect, useState } from 'react';
import { RegistrationService } from '@/service/registration-service';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Mockup data
const systemOverview = {
  topics: { total: 150, submitted: 50, approved: 80, rejected: 20 },
  councils: { total: 30, active: 10, upcoming: 15, closed: 5 },
  users: { total: 200, active: 180, inactive: 20 },
  registrationPeriods: { total: 10, open: 3, closed: 7 },
};

const currentRegistrationPeriod = {
  id: "STT_UTE_20250501_DK",
  title: "Đợt đăng ký đề tài nghiên cứu UTE 2025 - Đợt 1",
  decisionNumber: "QD123/2025",
  startDate: "2025-05-01",
  endDate: "2025-05-15",
  status: RegistrationPeriodStatus.OPEN,
};

const pendingTopics = [
  { id: "TOPIC2025-001", vietnameseName: "Nghiên cứu ứng dụng AI trong y học", topicCode: "AI2025-001", applications: 5 },
  { id: "TOPIC2025-002", vietnameseName: "Phát triển hệ thống năng lượng tái tạo", topicCode: "ENERGY2025-001", applications: 3 },
];

const activeCouncils = [
  { id: "COUNCIL2025-001", name: "Hội đồng AI 2025", topicCount: 3, startDate: "2025-05-01", endDate: "2025-06-30" },
  { id: "COUNCIL2025-002", name: "Hội đồng Năng lượng 2025", topicCount: 2, startDate: "2025-05-10", endDate: "2025-07-15" },
];

const categoryDistribution = [
  { name: "Công nghệ thông tin", count: 50 },
  { name: "Kỹ thuật điện", count: 30 },
  { name: "Khoa học tự nhiên", count: 20 },
];

const researchFieldDistribution = [
  { name: "Trí tuệ nhân tạo", count: 40 },
  { name: "Năng lượng tái tạo", count: 25 },
  { name: "Y học", count: 15 },
];

const userTopics = [
  { id: "TOPIC2025-003", vietnameseName: "Nghiên cứu IoT trong nông nghiệp", role: "Chủ nhiệm", status: "APPROVED" },
  { id: "TOPIC2025-004", vietnameseName: "Phát triển robot tự động", role: "Thành viên", status: "SUBMITTED" },
];

const pendingEvaluations = [
  { topicId: "TOPIC2025-005", topicName: "Nghiên cứu blockchain", applicant: "Nguyễn Văn A", evaluated: false },
  { topicId: "TOPIC2025-006", topicName: "Ứng dụng VR trong giáo dục", applicant: "Trần Thị B", evaluated: true },
];

const budgetInfo = {
  approved: 5000000000,
  remaining: 2000000000,
};

const recentActivities = [
  { description: "Đề tài 'Nghiên cứu AI' vừa được tạo", date: "2025-05-10" },
  { description: "Hội đồng 'AI 2025' vừa được tạo", date: "2025-05-09" },
  { description: "Đợt đăng ký 'Đợt 1 - UTE 2025' vừa mở", date: "2025-05-08" },
];

// Hàm hỗ trợ
const getStatusVariant = (status: RegistrationPeriodStatus | string) => {
  switch (status) {
    case RegistrationPeriodStatus.OPEN:
    case "APPROVED":
      return "default";
    case RegistrationPeriodStatus.REVIEWING:
    case "SUBMITTED":
      return "secondary";
    case RegistrationPeriodStatus.CLOSED:
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusText = (status: RegistrationPeriodStatus) => {
  switch (status) {
    case RegistrationPeriodStatus.OPEN:
      return "Đang diễn ra";
    case RegistrationPeriodStatus.REVIEWING:
      return "Sắp diễn ra";
    case RegistrationPeriodStatus.CLOSED:
      return "Đã kết thúc";
    default:
      return status;
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [registrationPeriods, setRegistrationPeriods] = useState([]);

  const fetchRegistrationPeriods = async () => {
    try {
      const response = await RegistrationService.getAll({
        p: 1,
        s: 4,
        sort: 'createdAt',
        order: 'desc',
      });

      if (response.status !== 200 || response.data.code !== 1000) {
        throw new Error("Lỗi khi tải dữ liệu");
      }

      setRegistrationPeriods(response.data.data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi tải dữ liệu.',
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    fetchRegistrationPeriods();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Quản lý nghiên cứu khoa học</h1>
          <p className="text-muted-foreground mt-1">Chào mừng đến với hệ thống quản lý nghiên cứu khoa học UTE-SciHub</p>
        </div>
        <Button onClick={() => navigate('/topics/create')} className="gap-2">
          <FilePlus className="h-4 w-4" />
          Tạo đề tài mới
        </Button>
      </div>

      {/* Section 1: Tổng quan */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Tổng số đề tài</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{systemOverview.topics.total}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Chờ duyệt: {systemOverview.topics.submitted}</p>
              <p>Đã xác nhận: {systemOverview.topics.approved}</p>
              <p>Cần điều chỉnh: {systemOverview.topics.rejected}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Tổng số hội đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{systemOverview.councils.total}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Đang hoạt động: {systemOverview.councils.active}</p>
              <p>Sắp diễn ra: {systemOverview.councils.upcoming}</p>
              <p>Đã kết thúc: {systemOverview.councils.closed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Tổng số người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{systemOverview.users.total}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Đang hoạt động: {systemOverview.users.active}</p>
              <p>Bị khóa: {systemOverview.users.inactive}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <CardTitle>Tổng số đợt đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{systemOverview.registrationPeriods.total}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Đang mở: {systemOverview.registrationPeriods.open}</p>
              <p>Đã đóng: {systemOverview.registrationPeriods.closed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Thông tin nổi bật */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Đợt đăng ký hiện tại */}
        <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Đợt đăng ký hiện tại</CardTitle>
            <CardDescription>Thông tin về đợt đăng ký đang mở</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusVariant(currentRegistrationPeriod.status)}>
                  {getStatusText(currentRegistrationPeriod.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateString(currentRegistrationPeriod.startDate)} - {formatDateString(currentRegistrationPeriod.endDate)}
                </span>
              </div>
              <p className="text-sm font-medium">
                {currentRegistrationPeriod.title.length > 100
                  ? `${currentRegistrationPeriod.title.substring(0, 100)}...`
                  : currentRegistrationPeriod.title}
              </p>
              <Button
                variant="link"
                className="text-primary-500 gap-1"
                onClick={() => navigate(`/registration/${currentRegistrationPeriod.id}`)}
              >
                Xem chi tiết
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Đề tài cần xử lý */}
        <Card className="md:col-span-3 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <CardHeader>
            <CardTitle>Đề tài cần xử lý</CardTitle>
            <CardDescription>Các đề tài đang chờ xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{topic.topicCode}</span>
                      <Badge variant="secondary">Chờ xử lý</Badge>
                    </div>
                    <p className="text-base font-semibold leading-tight">{topic.vietnameseName}</p>
                    <div className="text-sm text-muted-foreground">
                      Số đơn ứng tuyển: {topic.applications}
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

        {/* Hội đồng đang hoạt động */}
        <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Hội đồng đang hoạt động</CardTitle>
            <CardDescription>Các hội đồng hiện đang hoạt động</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCouncils.map((council) => (
                <div key={council.id} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-tight">{council.name}</p>
                    <div className="text-sm text-muted-foreground">
                      Số đề tài: {council.topicCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateString(council.startDate)} - {formatDateString(council.endDate)}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary-500 transition-colors" />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary-500 gap-1">
                Xem tất cả hội đồng
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Thống kê chi tiết */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Phân bố theo danh mục */}
        <Card className="animate-fade-in" style={{ animationDelay: '450ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="h-6 w-6 text-primary" />
            <CardTitle>Phân bố đề tài theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryDistribution.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className="h-4 bg-primary rounded"
                      style={{ width: `${(category.count / 150) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phân bố theo lĩnh vực nghiên cứu */}
        <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="h-6 w-6 text-primary" />
            <CardTitle>Phân bố đề tài theo lĩnh vực</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {researchFieldDistribution.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{field.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className="h-4 bg-primary rounded"
                      style={{ width: `${(field.count / 150) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{field.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Thông tin cá nhân */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Đề tài của người dùng */}
        <Card className="animate-fade-in" style={{ animationDelay: '550ms' }}>
          <CardHeader>
            <CardTitle>Đề tài của bạn</CardTitle>
            <CardDescription>Các đề tài bạn đang tham gia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(topic.status)}>{topic.status}</Badge>
                      <span className="text-sm font-medium text-muted-foreground">{topic.role}</span>
                    </div>
                    <p className="text-base font-semibold leading-tight">{topic.vietnameseName}</p>
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

        {/* Đánh giá cần thực hiện */}
        <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle>Đánh giá cần thực hiện</CardTitle>
            <CardDescription>Các đơn ứng tuyển cần đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEvaluations.map((evaluation) => (
                <div key={evaluation.topicId} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={evaluation.evaluated ? "default" : "secondary"}>
                        {evaluation.evaluated ? "Đã đánh giá" : "Chưa đánh giá"}
                      </Badge>
                    </div>
                    <p className="text-base font-semibold leading-tight">{evaluation.topicName}</p>
                    <div className="text-sm text-muted-foreground">
                      Ứng viên: {evaluation.applicant}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary-500 transition-colors" />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary-500 gap-1">
                Xem tất cả đánh giá
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Thông tin bổ sung */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Ngân sách */}
        <Card className="md:col-span-1 animate-fade-in" style={{ animationDelay: '650ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <CardTitle>Ngân sách</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tổng ngân sách đã phê duyệt</p>
              <p className="text-2xl font-bold">{budgetInfo.approved.toLocaleString()} VNĐ</p>
              <p className="text-sm font-medium mt-4">Tổng ngân sách còn lại</p>
              <p className="text-2xl font-bold">{budgetInfo.remaining.toLocaleString()} VNĐ</p>
            </div>
          </CardContent>
        </Card>

        {/* Hoạt động gần đây */}
        <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-tight">{activity.description}</p>
                    <div className="text-sm text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;