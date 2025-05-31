
import { ArrowRight, FilePlus, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { RegistrationPeriodStatus } from '@/models/enums/registration-period-status';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';
import { useEffect, useState } from 'react';
import { RegistrationService } from '@/service/registration-service';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Chatbot from '@/components/chatbot/Chatbot';

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

const getStatusVariant = (status: RegistrationPeriodStatus) => {
  switch (status) {
    case RegistrationPeriodStatus.OPEN:
      return "default"
    case RegistrationPeriodStatus.REVIEWING:
      return "secondary"
    case RegistrationPeriodStatus.CLOSED:
      return "destructive"
    default:
      return "outline"
  }
}

const getStatusText = (status: RegistrationPeriodStatus) => {
  switch (status) {
    case RegistrationPeriodStatus.OPEN:
      return "Đang diễn ra"
    case RegistrationPeriodStatus.REVIEWING:
      return "Sắp diễn ra"
    case RegistrationPeriodStatus.CLOSED:
      return "Đã kết thúc"
    default:
      return status
  }
}

const Index = () => {
  const navigate = useNavigate();
  const [registrationPeriods, setRegistrationPeriods] = useState([]);

  const fetchRegistrationPeriods = async () => {
    const response = await RegistrationService.getAll({
      p: 1,
      s: 4,
      sort: 'createdAt',
      order: 'desc',
    })

    if (response.status !== 200 && response.data.code !== 1000) {
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi tải dữ liệu.',
        variant: 'error',
      })

      return;
    }

    setRegistrationPeriods(response.data.data);
  };

  useEffect(() => {
    fetchRegistrationPeriods();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Quản lý nghiên cứu khoa học</h1>
          <p className="text-muted-foreground mt-1">Chào mừng đến với hệ thống quản lý nghiên cứu khoa học UTE-SciHub</p>
        </div>
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

        <Card className="md:col-span-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>Đợt đăng ký</CardTitle>
            <CardDescription>Thông tin về các đợt đăng ký đề tài nghiên cứu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrationPeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex flex-col space-y-3 group cursor-pointer"
                  onClick={() => navigate(`/registration/${period.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(period.status)}>{getStatusText(period.status)}</Badge>
                      <span className="text-xs text-muted-foreground">Quyết định số: {period.decisionNumber}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </span>
                  </div>
                  <p className="text-sm font-medium group-hover:text-primary-600 transition-colors" onClick={() => navigate(`/registration/${period.id}`)}>
                    {period.title.length > 100 ? `${period.title.substring(0, 100)}...` : period.title}
                  </p>

                  <Separator />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary-500 gap-1">
                Xem tất cả đợt đăng ký
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chatbot component positioned at the bottom right corner */}
      <Chatbot 
        title="UTE-SciHub Trợ lý" 
        initialMessages={[
          {
            content: "Xin chào! Tôi là trợ lý ảo của UTE-SciHub. Tôi có thể giúp gì cho bạn?",
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        ]}
      />
    </div>
  );
};

export default Index;
