import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultiFileUpload from "@/components/multiple-upload-file/multiple-upload-file";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import {
  ArrowLeft,
  FileText,
  Upload,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  CalendarIcon,
  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate, useParams } from "react-router-dom";
import type { Topic } from "@/models/topic";
import type { Document } from "@/models/document";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { enUS, vi } from "date-fns/locale";

const fileObjectSchema = z.object({
  file: z.instanceof(File, { message: "Vui lòng chọn file" }),
  description: z.string().min(1, { message: "Vui lòng nhập mô tả" }),
  url: z.string().optional(),
  id: z.string().optional(),
  originalFileName: z.string().optional(),
});

const acceptanceSchema = z.object({
  topicId: z.string().min(1, "Vui lòng chọn đề tài"),
  submissionDate: z.string().min(1, "Vui lòng chọn ngày nộp"),
  completionReport: z.array(fileObjectSchema).min(1, "Vui lòng tải lên báo cáo tổng kết"),
  bmDecision: z.array(fileObjectSchema).min(1, "Vui lòng tải lên quyết định BM.24-QT.01-KHCN"),
  researchProducts: z.array(fileObjectSchema).optional(),
  supportingDocuments: z.array(fileObjectSchema).optional(),
  applicationCertificates: z.array(fileObjectSchema).optional(),
  additionalDocuments: z.array(fileObjectSchema).optional(),
  notes: z.string().optional(),
  acknowledgment: z.boolean().refine((val) => val === true, {
    message: "Vui lòng xác nhận tính chính xác của thông tin",
  }),
});

type AcceptanceFormValues = z.infer<typeof acceptanceSchema>;

export default function AcceptanceSubmissionForm() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  const form = useForm<AcceptanceFormValues>({
    resolver: zodResolver(acceptanceSchema),
    defaultValues: {
      topicId: topicId || "",
      submissionDate: new Date().toISOString().split("T")[0],
      notes: "",
      acknowledgment: false,
    },
  });

  useEffect(() => {
    fetchTopics();
    if (topicId) {
      fetchTopicDetails(topicId);
    }
  }, [topicId]);

  const fetchTopics = async () => {
    try {
      // Mock data
      const mockTopics: Topic[] = [
        {
          id: "1",
          vietnameseName: "Nghiên cứu ứng dụng AI trong giáo dục",
          topicCode: "NCKH-2024-001",
          principalInvestigator: "TS. Nguyễn Văn A",
          status: TopicStatus.IN_PROGRESS,
          startDate: "2024-01-01",
          durationInMonths: 12,
          endYear: 2024,
          totalBudget: 100000000,
          expectedProducts: {
            scientific: { domestic: 2, international: 1 },
            training: { masters: 1, students: 2 },
            commercial: { details: "Phần mềm giáo dục" },
          },
          urgency: "Cao",
          keywords: ["AI", "Giáo dục"],
          transferForm: ["Báo cáo"],
          registrationPeriod: {} as any,
          budgetBreakdown: [],
          documents: [],
          department: { id: "1", name: "Khoa Công nghệ thông tin" } as any,
        },
      ];

      setTopics(mockTopics);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đề tài",
        variant: "error",
      });
    }
  };

  const fetchTopicDetails = async (id: string) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (topic) {
        setSelectedTopic(topic);
        form.setValue("topicId", id);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đề tài",
        variant: "error",
      });
    }
  };

  const handleSubmit = async (data: AcceptanceFormValues) => {
    setIsSubmitting(true);
    try {
      const documents: Partial<Document>[] = [];

      data.completionReport.forEach((file) => {
        documents.push({
          id: 0,
          topic: selectedTopic,
          documentType: "COMPLETION_REPORT",
          filePath: "",
          publicId: "",
          uploadDate: new Date().toISOString(),
          originalFileName: file.originalFileName,
        });
      });

      data.bmDecision.forEach((file) => {
        documents.push({
          id: 0,
          topic: selectedTopic,
          documentType: "BM_DECISION",
          filePath: "",
          publicId: "",
          uploadDate: new Date().toISOString(),
          originalFileName: file.originalFileName,
        });
      });

      if (data.researchProducts) {
        data.researchProducts.forEach((file) => {
          documents.push({
            id: 0,
            topic: selectedTopic,
            documentType: "RESEARCH_PRODUCT",
            filePath: "",
            publicId: "",
            uploadDate: new Date().toISOString(),
            originalFileName: file.originalFileName,
          });
        });
      }

      // Add other document types similarly
      if (data.supportingDocuments) {
        data.supportingDocuments.forEach((file) => {
          documents.push({
            id: 0,
            topic: selectedTopic,
            documentType: "SUPPORTING_DOCUMENT",
            filePath: "",
            publicId: "",
            uploadDate: new Date().toISOString(),
            originalFileName: file.originalFileName,
          });
        });
      }

      if (data.applicationCertificates) {
        data.applicationCertificates.forEach((file) => {
          documents.push({
            id: 0,
            topic: selectedTopic,
            documentType: "APPLICATION_CERTIFICATE",
            filePath: "",
            publicId: "",
            uploadDate: new Date().toISOString(),
            originalFileName: file.originalFileName,
          });
        });
      }

      if (data.additionalDocuments) {
        data.additionalDocuments.forEach((file) => {
          documents.push({
            id: 0,
            topic: selectedTopic,
            documentType: "ADDITIONAL_DOCUMENT",
            filePath: "",
            publicId: "",
            uploadDate: new Date().toISOString(),
            originalFileName: file.originalFileName,
          });
        });
      }

      // Mock update
      toast({
        title: "Thành công",
        description: "Hồ sơ đề nghị nghiệm thu đã được nộp thành công",
        variant: "success",
      });

      console.log(data);
      // navigate("/acceptance");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể nộp hồ sơ. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopicChange = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    setSelectedTopic(topic || null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nộp hồ sơ đề nghị nghiệm thu</h1>
          <p className="text-gray-600">Nộp hồ sơ nghiệm thu đề tài nghiên cứu khoa học</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin đề tài
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn đề tài nghiệm thu *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTopicChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đề tài cần nghiệm thu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id!}>
                            <div className="flex flex-col py-2">
                              <span className="font-medium">{topic.vietnameseName}</span>
                              <span className="text-sm text-gray-500">{topic.topicCode}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedTopic && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Chủ nhiệm đề tài</p>
                        <p className="font-semibold">{selectedTopic.principalInvestigator}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Đơn vị</p>
                        <p className="font-semibold">{selectedTopic.department?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Thời gian thực hiện</p>
                        <p className="font-semibold">{selectedTopic.durationInMonths} tháng</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Trạng thái</p>
                        <Badge className="bg-green-100 text-green-800">Đang thực hiện</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="submissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày nộp hồ sơ *</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal h-10", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(parse(field.value, "yyyy-MM-dd", new Date()), "yyyy-MM-dd", { locale: vi }) : <span>Chọn ngày</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(date: Date | undefined) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                            }}
                            initialFocus
                            disabled={(date) => date < new Date("1900-01-01") || date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-red-600" />
                Hồ sơ bắt buộc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lưu ý:</strong> Tất cả các tài liệu bắt buộc phải được ký và đóng dấu trước khi tải lên hệ thống.
                </AlertDescription>
              </Alert>
              <FormField
                control={form.control}
                name="bmDecision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-600">1. Đơn đề nghị nghiệm thu *</FormLabel>
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Hướng dẫn:</strong> Đơn đề nghị nghiệm thu là văn bản chính thức xác nhận việc hoàn thành đề tài.
                      </AlertDescription>
                    </Alert>
                    <FormControl>
                      <MultiFileUpload
                        form={form}
                        field={{
                          ...field,
                          value: field.value as { file: File; description: string }[] | undefined,
                          onChange: (value: { file: File; description: string }[] | undefined) => field.onChange(value),
                        }}
                        accept=".pdf,.doc,.docx"
                        maxSize={20}
                        label="Đơn đề nghị nghiệm thu *"
                        description="Đơn đề nghị nghiệm thu đã ký và đóng dấu (PDF, Word - tối đa 20MB mỗi file)"
                        placeholder="Tải lên đơn đề nghị nghiệm thu"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Đơn đề nghị nghiệm thu đã ký và đóng dấu (PDF, Word - tối đa 20MB mỗi file)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="completionReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-600">2. Báo cáo tổng kết đề tài (05 cuốn) *</FormLabel>
                    <FormControl>
                      <MultiFileUpload
                        form={form}
                        field={{
                          ...field,
                          value: field.value as { file: File; description: string }[] | undefined,
                          onChange: (value: { file: File; description: string }[] | undefined) => field.onChange(value),
                        }}
                        accept=".pdf,.doc,.docx"
                        maxSize={50}
                        label="Báo cáo tổng kết đề tài (05 cuốn) *"
                        description="Báo cáo tổng kết đề tài đã ký và đóng dấu (PDF, Word - tối đa 50MB mỗi file). Thêm mục mới cho mỗi báo cáo."
                        placeholder="Tải lên báo cáo tổng kết"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Báo cáo tổng kết đề tài đã ký và đóng dấu (PDF, Word - tối đa 50MB mỗi file). Thêm mục mới cho mỗi báo cáo bằng cách nhấn nút “+” bên dưới.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="researchProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. Các sản phẩm của đề tài</FormLabel>
                    <FormControl>
                      <MultiFileUpload
                        form={form}
                        field={{
                          ...field,
                          value: field.value as { file: File; description: string }[] | undefined,
                          onChange: (value: { file: File; description: string }[] | undefined) => field.onChange(value),
                        }}
                        accept=".pdf,.doc,.docx,.zip,.rar"
                        maxSize={100}
                        label="Các sản phẩm của đề tài"
                        description="Sản phẩm đề tài theo thuyết minh (PDF, Word, ZIP - tối đa 100MB mỗi file)"
                        placeholder="Tải lên sản phẩm đề tài"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Sản phẩm đề tài theo thuyết minh (PDF, Word, ZIP - tối đa 100MB mỗi file)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportingDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Tài liệu liên quan đến sản phẩm</FormLabel>
                    <FormControl>
                      <MultiFileUpload
                        form={form}
                        field={{
                          ...field,
                          value: field.value as { file: File; description: string }[] | undefined,
                          onChange: (value: { file: File; description: string }[] | undefined) => field.onChange(value),
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        maxSize={50}
                        label="Tài liệu liên quan đến sản phẩm"
                        description="Tài liệu liên quan đến sản phẩm đề tài (PDF, Word, Image - tối đa 50MB mỗi file)"
                        placeholder="Tải lên tài liệu liên quan"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Tài liệu liên quan đến sản phẩm đề tài (PDF, Word, Image - tối đa 50MB mỗi file)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5. Văn bản bổ sung khác</FormLabel>
                    <FormControl>
                      <MultiFileUpload
                        form={form}
                        field={{
                          ...field,
                          value: field.value as { file: File; description: string }[] | undefined,
                          onChange: (value: { file: File; description: string }[] | undefined) => field.onChange(value),
                        }}
                        accept=".pdf,.doc,.docx"
                        maxSize={50}
                        label="Văn bản bổ sung khác"
                        description="Các văn bản bổ sung, thay đổi nội dung và văn bản khác liên quan"
                        placeholder="Tải lên văn bản bổ sung"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Các văn bản bổ sung, thay đổi nội dung và văn bản khác liên quan
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ghi chú và xác nhận</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú bổ sung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập ghi chú bổ sung về hồ sơ nghiệm thu (nếu có)..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acknowledgment"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="acknowledgment"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                      <label htmlFor="acknowledgment" className="text-sm text-blue-800 leading-relaxed">
                        <strong>Tôi xác nhận rằng:</strong>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          <li>Tất cả thông tin và tài liệu được cung cấp là chính xác và đầy đủ</li>
                          <li>Các tài liệu đã được ký và đóng dấu theo quy định</li>
                          <li>Đề tài đã hoàn thành đúng theo kế hoạch và thuyết minh được phê duyệt</li>
                          <li>Tôi chịu trách nhiệm về tính chính xác của hồ sơ này</li>
                        </ul>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <Button type="button" className="text-red-500 hover:text-red-600" variant="outline" onClick={() => navigate(-1)}>
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline">
                    <Save className="h-4 w-4" />
                    Lưu nháp
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        Đang nộp...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Nộp hồ sơ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}