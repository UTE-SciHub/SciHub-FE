import { ArrowRight, FilePlus, ChevronRight, FileText, Users, Calendar, DollarSign, BarChart2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { RegistrationPeriodStatus } from '@/models/enums/registration-period-status';
import { formatDate, formatDateString, formatDateTime } from '@/utils/dateTimeFormat';
import { useEffect, useState } from 'react';
import { DashboardService } from '@/service/dashboard-service';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Types
interface DashboardOverview {
  topics: { total: number; submitted: number; approved: number; rejected: number };
  councils: { total: number; active: number; upcoming: number; closed: number };
  users: { total: number; active: number; inactive: number };
  activeCouncils: Array<{ id: number, name: string, topicCount : number, startDate: string, endDate: string}>
  registrationPeriods: { total: number; open: number; closed: number };
  categoryDistribution: Array<{ name: string; count: number }>;
  researchFieldDistribution: Array<{ name: string; count: number }>;
}

interface PendingEvaluation {
  topicId: string;
  topicName: string;
  applicant: string;
  evaluated: boolean;
}

interface RecentActivity {
  description: string;
  date: string;
}

interface BudgetInfo {
  approved: number;
  remaining: number;
}

// Helper functions
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
  const [loading, setLoading] = useState(true);
  const [systemOverview, setSystemOverview] = useState<DashboardOverview | null>(null);

  // Mockup data for sections not provided by getDashboardOverview
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

  const userTopics = [
    { id: "TOPIC2025-003", vietnameseName: "Nghiên cứu IoT trong nông nghiệp", role: "Chủ nhiệm", status: "APPROVED" },
    { id: "TOPIC2025-004", vietnameseName: "Phát triển robot tự động", role: "Thành viên", status: "SUBMITTED" },
  ];

  const pendingEvaluations: PendingEvaluation[] = [
    { topicId: "TOPIC2025-005", topicName: "Nghiên cứu blockchain", applicant: "Nguyễn Văn A", evaluated: false },
    { topicId: "TOPIC2025-006", topicName: "Ứng dụng VR trong giáo dục", applicant: "Trần Thị B", evaluated: true },
  ];

  const budgetInfo: BudgetInfo = {
    approved: 5000000000,
    remaining: 2000000000,
  };

  const recentActivities: RecentActivity[] = [
    { description: "Đề tài 'Nghiên cứu AI' vừa được tạo", date: "2025-05-10" },
    { description: "Hội đồng 'AI 2025' vừa được tạo", date: "2025-05-09" },
    { description: "Đợt đăng ký 'Đợt 1 - UTE 2025' vừa mở", date: "2025-05-08" },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getDashboardOverview();

      const data = response.data;

      setSystemOverview({
        topics: data.topics,
        councils: data.councils,
        users: data.users,
        registrationPeriods: data.registrationPeriods,
        categoryDistribution: data.categoryDistribution,
        researchFieldDistribution: data.researchFieldDistribution,
        activeCouncils: data.activeCouncils,
      });

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi tải dữ liệu dashboard.',
        variant: 'error',
      });
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !systemOverview) {
    return <div>Loading...</div>;
  }

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
              <p><span className="text-yellow-500">Chờ duyệt:</span> {systemOverview.topics.submitted}</p>
              <p><span className="text-green-500">Đã xác nhận:</span> {systemOverview.topics.approved}</p>
              <p><span className="text-red-500">Cần điều chỉnh:</span> {systemOverview.topics.rejected}</p>
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
              <p><span className="text-green-500">Đang hoạt động:</span> {systemOverview.councils.active}</p>
              <p><span className="text-yellow-500">Sắp diễn ra:</span> {systemOverview.councils.upcoming}</p>
              <p><span className="text-red-500">Đã kết thúc:</span> {systemOverview.councils.closed}</p>
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
              <p><span className="text-green-500">Đang hoạt động:</span> {systemOverview.users.active}</p>
              <p><span className="text-red-500">Bị khóa:</span> {systemOverview.users.inactive}</p>
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
              <p><span className="text-green-500">Đang mở:</span> {systemOverview.registrationPeriods.open}</p>
              <p><span className="text-red-500">Đã đóng:</span> {systemOverview.registrationPeriods.closed}</p>
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
            {currentRegistrationPeriod ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">Không có đợt đăng ký nào đang mở</p>
            )}
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
                      Số đơn ứng tuyển: <span className="text-green-500">{topic.applications}</span>
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
              {systemOverview.activeCouncils.map((council) => (
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
              {systemOverview.categoryDistribution.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className="h-4 bg-primary rounded"
                      style={{ width: `${(category.count / (systemOverview.topics.total || 1)) * 100}%` }}
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
              {systemOverview.researchFieldDistribution.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{field.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className="h-4 bg-primary rounded"
                      style={{ width: `${(field.count / (systemOverview.topics.total || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{field.count}</span>
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