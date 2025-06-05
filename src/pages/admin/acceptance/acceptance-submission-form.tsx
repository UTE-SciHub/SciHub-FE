import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import MultiFileUpload from "@/components/multiple-upload-file/multiple-upload-file";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
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
import { useNavigate, useParams } from "react-router-dom";
import type { Topic } from "@/models/topic";
import { AcceptanceService } from "@/service/acceptance-service";
import { TopicService } from "@/service/topic-service";
import useUserStore from "@/store/userStore";
import {DocumentType} from "@/models/document";
import Loading from "@/components/loading/loading";

const fileObjectSchema = z.object({
  file: z.instanceof(File, { message: "Vui lòng chọn file" }),
  description: z.string().min(1, { message: "Vui lòng nhập mô tả" }),
  url: z.string().optional(),
  id: z.string().optional(),
  originalFileName: z.string().optional(),
});

const acceptanceSchema = z.object({
  topicId: z.string().min(1, "Vui lòng chọn đề tài"),
  submissionDate: z.string().optional(),
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

  const user = useUserStore((state) => state.user);

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
      const response = await TopicService.getTopicsByPrincipalInvestigator(user.id);
      const topics = Array.isArray(response.data.data) ? response.data.data : [];
      setTopics(topics);
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


  const onSubmit = async (data: AcceptanceFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Chuẩn hóa dữ liệu chính
      const acceptanceData = {
        topicId: data.topicId,
        submissionDate: data.submissionDate,
        notes: data.notes,
        acknowledgment: data.acknowledgment,
      };
      // Đưa dữ liệu chính vào blob
      const jsonBlob = new Blob([JSON.stringify(acceptanceData)], { type: 'application/json' });
      formData.append('data', jsonBlob, 'acceptanceData.json');

      // Gom tất cả file và descriptions (có type) vào 2 mảng duy nhất
      const files: File[] = [];
      const descriptions: { description: string; type: string }[] = [];
      const pushFilesAndDescriptions = (arr: any[] | undefined, type: string) => {
        if (arr && arr.length > 0) {
          const validDocs = arr.filter(doc => doc.file instanceof File);
          validDocs.forEach(doc => {
            files.push(doc.file);
            descriptions.push({ description: doc.description, type });
          });
        }
      };
      pushFilesAndDescriptions(data.completionReport, DocumentType.COMPLETION_REPORT);
      pushFilesAndDescriptions(data.bmDecision, DocumentType.BM_DECISION);
      pushFilesAndDescriptions(data.researchProducts, DocumentType.RESEARCH_PRODUCT);
      pushFilesAndDescriptions(data.supportingDocuments, DocumentType.SUPPORTING_DOCUMENT);
      pushFilesAndDescriptions(data.applicationCertificates, DocumentType.APPLICATION_CERTIFICATE);
      pushFilesAndDescriptions(data.additionalDocuments, DocumentType.ADDITIONAL_DOCUMENT);

      files.forEach(file => formData.append('files', file));
      formData.append('descriptions', new Blob([JSON.stringify(descriptions)], { type: 'application/json' }), 'descriptions.json');

      // Gửi lên server
      const response = await AcceptanceService.submitAcceptance(formData);
      if (response.data.code === 1000 && response.data.status === 201) {
        toast({
          title: 'Nộp hồ sơ thành công',
          description: 'Hồ sơ đề nghị nghiệm thu đã được gửi thành công.',
          variant: 'success',
        });
        navigate(-1);
      } else {
        toast({
          title: 'Nộp hồ sơ thất bại',
          description: 'Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại.',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error);
      toast({
        title: 'Lỗi khi gửi dữ liệu',
        description: 'Vui lòng thử lại sau.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopicChange = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    setSelectedTopic(topic || null);
  };

  if(isSubmitting) {
    return <Loading onCancel={() => {
      setIsSubmitting(false);
      navigate(-1);
    }} />
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        maxSize={10}
                        label="Báo cáo tổng kết đề tài (05 cuốn) *"
                        description="Báo cáo tổng kết đề tài đã ký và đóng dấu (PDF, Word - tối đa 10MB mỗi file). Thêm mục mới cho mỗi báo cáo."
                        placeholder="Tải lên báo cáo tổng kết"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Báo cáo tổng kết đề tài đã ký và đóng dấu (PDF, Word - tối đa 10MB mỗi file). Thêm mục mới cho mỗi báo cáo bằng cách nhấn nút “+” bên dưới.
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
                        maxSize={10}
                        label="Các sản phẩm của đề tài"
                        description="Sản phẩm đề tài theo thuyết minh (PDF, Word, ZIP - tối đa 10MB mỗi file)"
                        placeholder="Tải lên sản phẩm đề tài"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Sản phẩm đề tài theo thuyết minh (PDF, Word, ZIP - tối đa 10MB mỗi file)
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
                        maxSize={10}
                        label="Tài liệu liên quan đến sản phẩm"
                        description="Tài liệu liên quan đến sản phẩm đề tài (PDF, Word, Image - tối đa 10MB mỗi file)"
                        placeholder="Tải lên tài liệu liên quan"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Tài liệu liên quan đến sản phẩm đề tài (PDF, Word, Image - tối đa 10MB mỗi file)
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
                        maxSize={10}
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